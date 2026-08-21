using FluentValidation;
using Mojjo.Application.DTOs.Orders;

namespace Mojjo.Application.Validators;

public class CreateOrderRequestValidator : AbstractValidator<CreateOrderRequest>
{
    public CreateOrderRequestValidator()
    {
        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("Order must contain at least one item.");

        RuleForEach(x => x.Items).SetValidator(new CreateOrderItemRequestValidator());

        RuleFor(x => x.Address)
            .NotNull().WithMessage("Delivery address is required.")
            .SetValidator(new ShippingAddressDtoValidator());

        RuleFor(x => x.DeliveryMethod)
            .Must(m => m.ToLower() is "standard" or "express")
            .WithMessage("Delivery method must be 'standard' or 'express'.");

        RuleFor(x => x.PaymentMethod)
            .Must(p => p.ToLower() is "cod" or "esewa" or "khalti")
            .WithMessage("Payment method must be 'cod', 'esewa', or 'khalti'.");
    }
}

public class CreateOrderItemRequestValidator : AbstractValidator<CreateOrderItemRequest>
{
    public CreateOrderItemRequestValidator()
    {
        RuleFor(x => x.ProductId).NotEmpty().WithMessage("ProductId is required.");
        RuleFor(x => x.Quantity).InclusiveBetween(1, 50).WithMessage("Quantity must be between 1 and 50.");
    }
}

public class ShippingAddressDtoValidator : AbstractValidator<ShippingAddressDto>
{
    public ShippingAddressDtoValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Phone).NotEmpty().Matches(@"^[0-9\+\-\s]{7,15}$");
        RuleFor(x => x.StreetAddress).NotEmpty().MaximumLength(250);
        RuleFor(x => x.Area).NotEmpty().MaximumLength(100);
    }
}
