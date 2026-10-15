namespace FateConnect.Api.Modules.Emails.Interfaces;

using System.Threading.Tasks;
using FateConnect.Api.Modules.Emails.Enums;

public interface IEmailService
{
    Task SendAsync(EnumAccountEmail email, string toEmail, string fullName, string link);
}
