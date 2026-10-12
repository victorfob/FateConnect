namespace FateConnect.Api.Modules.Communications.Interfaces;

using System.Threading.Tasks;
using FateConnect.Api.Modules.Communications.Enums;

public interface IEmailService
{
    Task SendAsync(EnumAccountEmail email, string toEmail, string fullName, string link);
}
