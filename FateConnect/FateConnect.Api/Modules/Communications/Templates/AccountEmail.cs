namespace FateConnect.Api.Modules.Communications.Templates;

using System;
using System.Collections.Generic;

public sealed record AccountEmail(
    string Subject,
    string Route,
    string ActionLabel,
    Func<string, IReadOnlyList<string>> ParagraphsPointingTo,
    string IfItWasNotYou
);
