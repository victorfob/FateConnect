namespace FateConnect.Api.Infrastructure.OpenApi;

using System;

[AttributeUsage(AttributeTargets.Property)]
public sealed class SchemaExampleAttribute(object value) : Attribute
{
    public object Value { get; } = value;

    public bool IsJson { get; set; }
}
