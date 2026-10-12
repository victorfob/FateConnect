namespace FateConnect.Api.Modules.InAppNotifications.Exceptions;

using System;

public abstract class InAppNotificationDomainException(string message) : Exception(message);

public class InvalidInAppNotificationContentException()
: InAppNotificationDomainException("O conteúdo da notificação não pode ser vazio.");

