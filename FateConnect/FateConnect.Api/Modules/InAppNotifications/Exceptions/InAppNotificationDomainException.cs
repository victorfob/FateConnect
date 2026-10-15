namespace FateConnect.Api.Modules.InAppNotifications.Exceptions;

using System;

public abstract class InAppNotificationDomainException(string message) : Exception(message);

public class InvalidInAppNotificationContentException()
    : InAppNotificationDomainException("The notification content cannot be empty.");

public class InAppNotificationNotFoundException()
    : Exception("The notification was not found or does not belong to you.");
