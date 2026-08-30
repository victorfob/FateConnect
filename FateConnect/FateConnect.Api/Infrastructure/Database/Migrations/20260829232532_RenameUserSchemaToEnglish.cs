using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FateConnect.Api.Infrastructure.Database.Migrations
{
    public partial class RenameUserSchemaToEnglish : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_rides_Usuarios_DriverId",
                table: "rides");

            migrationBuilder.DropForeignKey(
                name: "FK_Contatos_Usuarios_UsuarioId",
                table: "Contatos");

            migrationBuilder.DropForeignKey(
                name: "FK_Enderecos_Usuarios_UsuarioId",
                table: "Enderecos");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Contatos",
                table: "Contatos");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Enderecos",
                table: "Enderecos");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Usuarios",
                table: "Usuarios");

            migrationBuilder.RenameTable(
                name: "Usuarios",
                newName: "Users");

            migrationBuilder.RenameTable(
                name: "Enderecos",
                newName: "Addresses");

            migrationBuilder.RenameTable(
                name: "Contatos",
                newName: "Contacts");

            migrationBuilder.RenameColumn(
                name: "EmailFatec",
                table: "Users",
                newName: "FatecEmail");

            migrationBuilder.RenameColumn(
                name: "Senha",
                table: "Users",
                newName: "Password");

            migrationBuilder.RenameColumn(
                name: "NomeCompleto",
                table: "Users",
                newName: "FullName");

            migrationBuilder.RenameColumn(
                name: "Apelido",
                table: "Users",
                newName: "Nickname");

            migrationBuilder.RenameColumn(
                name: "DataNascimento",
                table: "Users",
                newName: "BirthDate");

            migrationBuilder.RenameColumn(
                name: "Genero",
                table: "Users",
                newName: "Gender");

            migrationBuilder.RenameColumn(
                name: "DataCadastro",
                table: "Users",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "DataAtualizacao",
                table: "Users",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "Perfil",
                table: "Users",
                newName: "ProfileType");

            migrationBuilder.RenameColumn(
                name: "Cep",
                table: "Addresses",
                newName: "ZipCode");

            migrationBuilder.RenameColumn(
                name: "Logradouro",
                table: "Addresses",
                newName: "Street");

            migrationBuilder.RenameColumn(
                name: "Numero",
                table: "Addresses",
                newName: "StreetNumber");

            migrationBuilder.RenameColumn(
                name: "Complemento",
                table: "Addresses",
                newName: "Complement");

            migrationBuilder.RenameColumn(
                name: "Cidade",
                table: "Addresses",
                newName: "City");

            migrationBuilder.RenameColumn(
                name: "Estado",
                table: "Addresses",
                newName: "State");

            migrationBuilder.RenameColumn(
                name: "UsuarioId",
                table: "Addresses",
                newName: "UserId");

            migrationBuilder.RenameColumn(
                name: "Telefone",
                table: "Contacts",
                newName: "Phone");

            migrationBuilder.RenameColumn(
                name: "EmailContato",
                table: "Contacts",
                newName: "ContactEmail");

            migrationBuilder.RenameColumn(
                name: "UsuarioId",
                table: "Contacts",
                newName: "UserId");

            migrationBuilder.RenameIndex(
                name: "IX_Enderecos_UsuarioId",
                table: "Addresses",
                newName: "IX_Addresses_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_Contatos_UsuarioId",
                table: "Contacts",
                newName: "IX_Contacts_UserId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Users",
                table: "Users",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Addresses",
                table: "Addresses",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Contacts",
                table: "Contacts",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Addresses_Users_UserId",
                table: "Addresses",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Contacts_Users_UserId",
                table: "Contacts",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_rides_Users_DriverId",
                table: "rides",
                column: "DriverId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_rides_Users_DriverId",
                table: "rides");

            migrationBuilder.DropForeignKey(
                name: "FK_Addresses_Users_UserId",
                table: "Addresses");

            migrationBuilder.DropForeignKey(
                name: "FK_Contacts_Users_UserId",
                table: "Contacts");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Contacts",
                table: "Contacts");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Addresses",
                table: "Addresses");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Users",
                table: "Users");

            migrationBuilder.RenameIndex(
                name: "IX_Contacts_UserId",
                table: "Contacts",
                newName: "IX_Contatos_UsuarioId");

            migrationBuilder.RenameIndex(
                name: "IX_Addresses_UserId",
                table: "Addresses",
                newName: "IX_Enderecos_UsuarioId");

            migrationBuilder.RenameColumn(
                name: "Phone",
                table: "Contacts",
                newName: "Telefone");

            migrationBuilder.RenameColumn(
                name: "ContactEmail",
                table: "Contacts",
                newName: "EmailContato");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "Contacts",
                newName: "UsuarioId");

            migrationBuilder.RenameColumn(
                name: "ZipCode",
                table: "Addresses",
                newName: "Cep");

            migrationBuilder.RenameColumn(
                name: "Street",
                table: "Addresses",
                newName: "Logradouro");

            migrationBuilder.RenameColumn(
                name: "StreetNumber",
                table: "Addresses",
                newName: "Numero");

            migrationBuilder.RenameColumn(
                name: "Complement",
                table: "Addresses",
                newName: "Complemento");

            migrationBuilder.RenameColumn(
                name: "City",
                table: "Addresses",
                newName: "Cidade");

            migrationBuilder.RenameColumn(
                name: "State",
                table: "Addresses",
                newName: "Estado");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "Addresses",
                newName: "UsuarioId");

            migrationBuilder.RenameColumn(
                name: "FatecEmail",
                table: "Users",
                newName: "EmailFatec");

            migrationBuilder.RenameColumn(
                name: "Password",
                table: "Users",
                newName: "Senha");

            migrationBuilder.RenameColumn(
                name: "FullName",
                table: "Users",
                newName: "NomeCompleto");

            migrationBuilder.RenameColumn(
                name: "Nickname",
                table: "Users",
                newName: "Apelido");

            migrationBuilder.RenameColumn(
                name: "BirthDate",
                table: "Users",
                newName: "DataNascimento");

            migrationBuilder.RenameColumn(
                name: "Gender",
                table: "Users",
                newName: "Genero");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "Users",
                newName: "DataCadastro");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "Users",
                newName: "DataAtualizacao");

            migrationBuilder.RenameColumn(
                name: "ProfileType",
                table: "Users",
                newName: "Perfil");

            migrationBuilder.RenameTable(
                name: "Contacts",
                newName: "Contatos");

            migrationBuilder.RenameTable(
                name: "Addresses",
                newName: "Enderecos");

            migrationBuilder.RenameTable(
                name: "Users",
                newName: "Usuarios");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Usuarios",
                table: "Usuarios",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Enderecos",
                table: "Enderecos",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Contatos",
                table: "Contatos",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Contatos_Usuarios_UsuarioId",
                table: "Contatos",
                column: "UsuarioId",
                principalTable: "Usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Enderecos_Usuarios_UsuarioId",
                table: "Enderecos",
                column: "UsuarioId",
                principalTable: "Usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_rides_Usuarios_DriverId",
                table: "rides",
                column: "DriverId",
                principalTable: "Usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
