namespace FateConnect.Api.Modules.Communications.Interfaces;

using System.Threading.Tasks;

public interface IEmailService
{
    Task SendConfirmationEmailAsync(string toEmail, string fullName, string confirmationLink);
}
