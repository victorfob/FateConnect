namespace FateConnect.Api.Modules.Users.Filters;

using System;
using FateConnect.Api.Modules.Users.Enums;

[AttributeUsage(AttributeTargets.Property)]
public sealed class CurrentDocumentVersionExampleAttribute(EnumDocumentType document) : Attribute
{
    public EnumDocumentType Document { get; } = document;
}
