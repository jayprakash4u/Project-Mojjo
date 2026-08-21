using FluentValidation;
using Mojjo.Application.DTOs.Payments;

namespace Mojjo.Application.Validators;

public class InitiatePaymentRequestValidator : AbstractValidator<InitiatePaymentRequest>
{
    public InitiatePaymentRequestValidator()
    {
        RuleFor(x => x.OrderId).NotEmpty().WithMessage("OrderId is required.");
        RuleFor(x => x.Gateway)
            .Must(g => g.ToLower() is "esewa" or "khalti")
            .WithMessage("Gateway must be either 'esewa' or 'khalti'.");
    }
}

public class VerifyEsewaPaymentRequestValidator : AbstractValidator<VerifyEsewaPaymentRequest>
{
    public VerifyEsewaPaymentRequestValidator()
    {
        RuleFor(x => x.Data).NotEmpty().WithMessage("Encoded eSewa data payload is required.");
    }
}

public class VerifyKhaltiPaymentRequestValidator : AbstractValidator<VerifyKhaltiPaymentRequest>
{
    public VerifyKhaltiPaymentRequestValidator()
    {
        RuleFor(x => x.Pidx).NotEmpty().WithMessage("Khalti PIDX is required.");
    }
}
