import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { FolderRole } from 'generated/prisma/enums';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class FoldersService {
    constructor(private prisma: PrismaService) { }

    async createFolder(name: string, ownerMatricula: string) {
        return this.prisma.folder.create({
            data: {
                nome: name,
                users: {
                    create: {
                        userMatricula: ownerMatricula,
                        role: FolderRole.PROPRIETARIO
                    }
                }
            },
            include: {
                users: true
            }
        })
    }

    async getMyFolders(userMatricula: string) {
        return this.prisma.folder.findMany({
            where: {
                users: {
                    some: {
                        userMatricula: userMatricula
                    }
                }
            },
            include: {
                users: true,
                books: true
            }
        })
    }





    async getFolderById(id: string, userMatricula: string) {
        await this.checkMembership(id, userMatricula);

        const folder = await this.prisma.folder.findUnique({
            where: { id },
            include: { users: true, books: true }
        })

        if (!folder) throw new NotFoundException("Pasta não encontrada");
        return folder;
    }

    async updateFolderName(
        id: string,
        newName: string,
        userMatricula: string
    ) {
        await this.checkEditPermission(id, userMatricula);
        try {
            return await this.prisma.folder.update({
                where: { id },
                data: { nome: newName }
            })
        } catch (e) {
            if (this.isPrismaError(e, 'P2025')) {
                throw new NotFoundException(`Pasta com ID ${id} não encontrada.`);
            }
            throw e;
        }
    }

    async deleteFolder(id: string, userMatricula: string) {
        // 1. Verifica permissão de proprietário
        await this.checkOwnerPermission(id, userMatricula);

        // 2. Deleta
        try {
            return await this.prisma.folder.delete({
                where: { id },
            });
        } catch (e) {
            if (this.isPrismaError(e, 'P2025')) {
                throw new NotFoundException(`Pasta com ID ${id} não encontrada.`);
            }
            throw e;
        }
    }

    async addBookToFolder(
        folderId: string,
        userMatricula: string,
        bookId: string,
    ) {
        // 1. Verifica permissão de edição
        await this.checkEditPermission(folderId, userMatricula);

        // 2. Adiciona (connect)
        try {
            return await this.prisma.folder.update({
                where: { id: folderId },
                data: { books: { connect: { id: bookId } } },
                include: { books: true },
            });
        } catch (e) {
            // P2025 pode ocorrer se o bookId ou folderId não existirem
            if (this.isPrismaError(e, 'P2025')) {
                throw new NotFoundException(
                    'Pasta ou Livro não encontrado.',
                );
            }
            throw e;
        }
    }

    /**
     * Remove um livro da pasta (Requer permissão de EDITOR ou PROPRIETARIO).
     */
    async removeBookFromFolder(
        folderId: string,
        userMatricula: string,
        bookId: string,
    ) {
        // 1. Verifica permissão de edição
        await this.checkEditPermission(folderId, userMatricula);

        // 2. Remove (disconnect)
        try {
            return await this.prisma.folder.update({
                where: { id: folderId },
                data: { books: { disconnect: { id: bookId } } },
                include: { books: true },
            });
        } catch (e) {
            if (this.isPrismaError(e, 'P2025')) {
                throw new NotFoundException(
                    'Pasta ou Livro não encontrado para desconectar.',
                );
            }
            throw e;
        }
    }

    /**
     * Adiciona um usuário a uma pasta (Requer permissão de PROPRIETARIO).
     */
    async addUserToFolder(
        folderId: string,
        requestingUserMatricula: string,
        newUserMatricula: string,
        role: FolderRole,
    ) {
        // 1. Verifica se o requisitante é proprietário
        await this.checkOwnerPermission(folderId, requestingUserMatricula);

        // 2. Adiciona o novo usuário
        try {
            return await this.prisma.folderUser.create({
                data: {
                    folderId,
                    userMatricula: newUserMatricula,
                    role,
                },
            });
        } catch (e) {
            if (this.isPrismaError(e, 'P2002')) {
                throw new ConflictException(
                    `Usuário ${newUserMatricula} já é membro desta pasta.`,
                );
            }
            // P2003 pode ocorrer se a matricula do novo usuário não existir
            if (this.isPrismaError(e, 'P2003')) {
                throw new NotFoundException(
                    `Usuário com matrícula ${newUserMatricula} não encontrado.`,
                );
            }
            throw e;
        }
    }

    /**
     * Remove um usuário de uma pasta (Requer permissão de PROPRIETARIO).
     */
    async removeUserFromFolder(
        folderId: string,
        requestingUserMatricula: string,
        userToRemoveMatricula: string,
    ) {
        // 1. Verifica se o requisitante é proprietário
        await this.checkOwnerPermission(folderId, requestingUserMatricula);

        // 2. Deleta a relação
        try {
            return await this.prisma.folderUser.delete({
                where: {
                    folderId_userMatricula: {
                        folderId,
                        userMatricula: userToRemoveMatricula,
                    },
                },
            });
        } catch (e) {
            if (this.isPrismaError(e, 'P2025')) {
                throw new NotFoundException(
                    `Usuário ${userToRemoveMatricula} não é membro desta pasta.`,
                );
            }
            throw e;
        }
    }


    private async getMembership(folderId: string, userMatricula: string) {
        const memberShip = await this.prisma.folderUser.findUnique({
            where: {
                folderId_userMatricula: { folderId, userMatricula },
            },
        });

        if (!memberShip) {
            // Precisamos saber se a pasta existe para dar 403 ou 404
            const folderExists = await this.prisma.folder.count({ where: { id: folderId } });
            if (folderExists === 0) {
                throw new NotFoundException("Pasta não encontrada.");
            }
            throw new ForbiddenException('Usuário não é membro desta pasta.');
        }
        return memberShip;
    }


    private async checkMembership(folderId: string, userMatricula: string) {
        await this.getMembership(folderId, userMatricula);
        // Se não houver erro, o usuário é membro.
    }


    private async checkEditPermission(folderId: string, userMatricula: string) {
        const memberShip = await this.getMembership(folderId, userMatricula);
        const allowedRoles: FolderRole[] = [
            FolderRole.PROPRIETARIO,
            FolderRole.EDITOR,
        ];

        if (!allowedRoles.includes(memberShip.role)) {
            throw new ForbiddenException(
                'Você não tem permissões (Editor ou Proprietário) para esta ação.',
            );
        }
    }

    private async checkOwnerPermission(folderId: string, userMatricula: string) {
        const memberShip = await this.getMembership(folderId, userMatricula);
        if (memberShip.role !== FolderRole.PROPRIETARIO) {
            throw new ForbiddenException(
                'Apenas o proprietário pode realizar esta ação.',
            );
        }
    }

    /**
     * Helper para checagem de erros do Prisma
     */
    private isPrismaError(e: any, code: string): boolean {
        return (
            e instanceof Prisma.PrismaClientKnownRequestError && e.code === code
        );
    }
}
