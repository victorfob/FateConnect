namespace FateConnect.Api.Modules.Communications.Consumers;

using FateConnect.Api.Modules.Emails.Enums;

public sealed record AccountEmailDispatch(EnumAccountEmail Email, int UserId, string FullName, string FatecEmail, string Token);
