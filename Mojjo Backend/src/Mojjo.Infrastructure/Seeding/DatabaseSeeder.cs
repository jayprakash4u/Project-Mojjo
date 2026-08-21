using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Mojjo.Domain.Constants;
using Mojjo.Domain.Entities;
using Mojjo.Domain.Enums;
using Mojjo.Infrastructure.Persistence;

namespace Mojjo.Infrastructure.Seeding;

public static class DatabaseSeeder
{
    private static string Img(string label) =>
        $"https://placehold.co/800x800/f2efe6/0b1f2a?font=source-sans-pro&text={Uri.EscapeDataString(label)}";

    public static async Task SeedAsync(MojjoDbContext context, RoleManager<ApplicationRole> roleManager, UserManager<ApplicationUser> userManager)
    {
        // 1. Seed Roles
        foreach (var roleName in AppRoles.All)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                await roleManager.CreateAsync(new ApplicationRole(roleName)
                {
                    Description = $"Standard system role for {roleName}"
                });
            }
        }

        // 2. Seed Default Administrator Account
        var adminEmail = "admin@mojjo.com";
        var existingAdmin = await userManager.FindByEmailAsync(adminEmail);
        if (existingAdmin == null)
        {
            var adminUser = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                PhoneNumber = "9801234567",
                FullName = "Mojjo SuperAdmin",
                EmailConfirmed = true,
                PhoneNumberConfirmed = true,
                CreatedAt = DateTime.UtcNow
            };

            var adminCreated = await userManager.CreateAsync(adminUser, "MojjoAdmin2026!#");
            if (adminCreated.Succeeded)
            {
                await userManager.AddToRolesAsync(adminUser, new[] { AppRoles.Admin, AppRoles.Manager });
            }
        }

        // 3. Seed Default Customer Account
        var customerEmail = "customer@mojjo.com";
        var existingCustomer = await userManager.FindByEmailAsync(customerEmail);
        if (existingCustomer == null)
        {
            var customerUser = new ApplicationUser
            {
                UserName = customerEmail,
                Email = customerEmail,
                PhoneNumber = "9841234567",
                FullName = "Prashant Sharma",
                RewardCoinBalance = 250,
                EmailConfirmed = true,
                PhoneNumberConfirmed = true,
                CreatedAt = DateTime.UtcNow
            };

            var customerCreated = await userManager.CreateAsync(customerUser, "CustomerPass123!");
            if (customerCreated.Succeeded)
            {
                await userManager.AddToRoleAsync(customerUser, AppRoles.Customer);

                // Seed address for default customer
                context.UserAddresses.Add(new UserAddress
                {
                    UserId = customerUser.Id,
                    Label = "Home",
                    FullName = "Prashant Sharma",
                    Phone = "9841234567",
                    Address = "Jhamsikhel Road, Near St. Mary's School",
                    Landmark = "Opposite Coffee Station",
                    IsDefault = true
                });
            }
        }

        // 4. Check if Catalog is already seeded
        if (await context.Categories.AnyAsync())
        {
            await context.SaveChangesAsync();
            return;
        }

        // 5. Seed Categories & Subcategories
        var alcoholCategory = new Category
        {
            Id = "cat-alcohol",
            Slug = "alcohol",
            Name = "Alcohol",
            Description = "Single malts, reserve reds, craft beer and everything in between — chosen for the occasion, not the shelf.",
            Icon = "Wine",
            Banner = Img("Alcohol"),
            DisplayOrder = 1,
            IsActive = true
        };

        var alcoholSubcategories = new List<Subcategory>
        {
            new() { Id = "sub-whisky", Slug = "whisky", Name = "Whisky", CategoryId = alcoholCategory.Id, DisplayOrder = 1 },
            new() { Id = "sub-wine", Slug = "wine", Name = "Wine", CategoryId = alcoholCategory.Id, DisplayOrder = 2 },
            new() { Id = "sub-beer", Slug = "beer", Name = "Beer", CategoryId = alcoholCategory.Id, DisplayOrder = 3 },
            new() { Id = "sub-vodka", Slug = "vodka", Name = "Vodka", CategoryId = alcoholCategory.Id, DisplayOrder = 4 },
            new() { Id = "sub-rum", Slug = "rum", Name = "Rum", CategoryId = alcoholCategory.Id, DisplayOrder = 5 },
            new() { Id = "sub-tequila", Slug = "tequila", Name = "Tequila", CategoryId = alcoholCategory.Id, DisplayOrder = 6 },
            new() { Id = "sub-gin", Slug = "gin", Name = "Gin", CategoryId = alcoholCategory.Id, DisplayOrder = 7 }
        };

        var cigarettesCategory = new Category
        {
            Id = "cat-cigarettes",
            Slug = "cigarettes",
            Name = "Cigarettes",
            Description = "Everyday brands in full-flavour, light and menthol, sold to over-18s only.",
            Icon = "Cigarette",
            Banner = Img("Cigarettes"),
            DisplayOrder = 2,
            IsActive = true
        };

        var snacksCategory = new Category
        {
            Id = "cat-snacks",
            Slug = "snacks",
            Name = "Snacks",
            Description = "The things you actually reach for mid-evening — crisps, roasted nuts, chocolate and quick bites.",
            Icon = "Utensils",
            Banner = Img("Snacks"),
            DisplayOrder = 3,
            IsActive = true
        };

        var snacksSubcategories = new List<Subcategory>
        {
            new() { Id = "sub-chips", Slug = "chips", Name = "Chips", CategoryId = snacksCategory.Id, DisplayOrder = 1 },
            new() { Id = "sub-nuts", Slug = "nuts", Name = "Nuts", CategoryId = snacksCategory.Id, DisplayOrder = 2 },
            new() { Id = "sub-chocolates", Slug = "chocolates", Name = "Chocolates", CategoryId = snacksCategory.Id, DisplayOrder = 3 },
            new() { Id = "sub-quick-bites", Slug = "quick-bites", Name = "Quick Bites", CategoryId = snacksCategory.Id, DisplayOrder = 4 }
        };

        var coldDrinksCategory = new Category
        {
            Id = "cat-cold-drinks",
            Slug = "cold-drinks",
            Name = "Cold Drinks",
            Description = "Chilled colas, sparkling water, energy drinks and the tonic and soda that finish a long drink.",
            Icon = "GlassWater",
            Banner = Img("Cold Drinks"),
            DisplayOrder = 4,
            IsActive = true
        };

        var coldDrinksSubcategories = new List<Subcategory>
        {
            new() { Id = "sub-soft-drinks", Slug = "soft-drinks", Name = "Soft Drinks", CategoryId = coldDrinksCategory.Id, DisplayOrder = 1 },
            new() { Id = "sub-water", Slug = "water", Name = "Water", CategoryId = coldDrinksCategory.Id, DisplayOrder = 2 },
            new() { Id = "sub-energy-drinks", Slug = "energy-drinks", Name = "Energy Drinks", CategoryId = coldDrinksCategory.Id, DisplayOrder = 3 },
            new() { Id = "sub-mixers", Slug = "mixers", Name = "Mixers", CategoryId = coldDrinksCategory.Id, DisplayOrder = 4 }
        };

        await context.Categories.AddRangeAsync(alcoholCategory, cigarettesCategory, snacksCategory, coldDrinksCategory);
        await context.Subcategories.AddRangeAsync(alcoholSubcategories);
        await context.Subcategories.AddRangeAsync(snacksSubcategories);
        await context.Subcategories.AddRangeAsync(coldDrinksSubcategories);
        await context.SaveChangesAsync();

        // 6. Seed Products
        var products = new List<Product>
        {
            new()
            {
                Id = "p-1",
                Slug = "premium-single-malt-whisky",
                Title = "Premium Single Malt Whisky",
                CategoryId = alcoholCategory.Id,
                SubcategoryId = "sub-whisky",
                Price = 8500,
                OriginalPrice = 9500,
                Image = Img("Single Malt"),
                Rating = 4.8,
                ReviewCount = 124,
                Badge = ProductBadge.Sale,
                Description = "A rich, rounded single malt with honey and vanilla on the nose and a long, gently oaked finish.",
                Volume = "750 ml",
                Origin = "Scotland",
                RewardCoins = 43,
                PhysicalStock = 100,
                AgeRestricted = true,
                Details = new List<ProductDetail>
                {
                    new() { Label = "Type", Value = "Single malt" },
                    new() { Label = "ABV", Value = "40%" },
                    new() { Label = "Region", Value = "Speyside" },
                    new() { Label = "Cask", Value = "Ex-bourbon" }
                }
            },
            new()
            {
                Id = "p-2",
                Slug = "reserve-red-wine",
                Title = "Reserve Red Wine",
                CategoryId = alcoholCategory.Id,
                SubcategoryId = "sub-wine",
                Price = 4200,
                Image = Img("Red Wine"),
                Rating = 4.5,
                ReviewCount = 89,
                Description = "Bold Cabernet Sauvignon with dark berry fruit, soft tannins and a smooth, warming finish.",
                Volume = "750 ml",
                Origin = "France",
                RewardCoins = 21,
                PhysicalStock = 100,
                AgeRestricted = true,
                Details = new List<ProductDetail>
                {
                    new() { Label = "Type", Value = "Red wine" },
                    new() { Label = "ABV", Value = "13.5%" },
                    new() { Label = "Grape", Value = "Cabernet Sauvignon" },
                    new() { Label = "Vintage", Value = "2021" }
                }
            },
            new()
            {
                Id = "p-3",
                Slug = "craft-ipa-beer-pack",
                Title = "Craft IPA Beer Pack",
                CategoryId = alcoholCategory.Id,
                SubcategoryId = "sub-beer",
                Price = 1800,
                OriginalPrice = 2200,
                Image = Img("Craft IPA"),
                Rating = 4.3,
                ReviewCount = 56,
                Badge = ProductBadge.New,
                Description = "Hoppy and refreshing IPA with citrus peel and pine resin, brewed in small batches.",
                Volume = "6 x 330 ml",
                Origin = "Nepal",
                RewardCoins = 9,
                PhysicalStock = 100,
                AgeRestricted = true,
                Details = new List<ProductDetail>
                {
                    new() { Label = "Type", Value = "IPA" },
                    new() { Label = "ABV", Value = "5.5%" },
                    new() { Label = "Pack", Value = "6 bottles" },
                    new() { Label = "IBU", Value = "55" }
                }
            },
            new()
            {
                Id = "p-4",
                Slug = "premium-vodka-750ml",
                Title = "Premium Vodka",
                CategoryId = alcoholCategory.Id,
                SubcategoryId = "sub-vodka",
                Price = 3200,
                Image = Img("Vodka"),
                Rating = 4.6,
                ReviewCount = 42,
                Description = "Five-times distilled and charcoal filtered for a clean, neutral profile that mixes effortlessly.",
                Volume = "750 ml",
                Origin = "Poland",
                RewardCoins = 16,
                PhysicalStock = 100,
                AgeRestricted = true,
                Details = new List<ProductDetail>
                {
                    new() { Label = "Type", Value = "Vodka" },
                    new() { Label = "ABV", Value = "40%" }
                }
            },
            new()
            {
                Id = "p-5",
                Slug = "artisan-truffle-chips",
                Title = "Artisan Truffle Potato Chips",
                CategoryId = snacksCategory.Id,
                SubcategoryId = "sub-chips",
                Price = 350,
                OriginalPrice = 420,
                Image = Img("Truffle Chips"),
                Rating = 4.7,
                ReviewCount = 78,
                Badge = ProductBadge.Bestseller,
                Description = "Hand-cooked potato crisps lightly dusted with black summer truffle and sea salt.",
                Volume = "125 g",
                Origin = "Spain",
                RewardCoins = 2,
                PhysicalStock = 100,
                AgeRestricted = false,
                Details = new List<ProductDetail>
                {
                    new() { Label = "Weight", Value = "125g" },
                    new() { Label = "Dietary", Value = "Vegetarian, Gluten Free" }
                }
            },
            new()
            {
                Id = "p-6",
                Slug = "roasted-salted-cashews",
                Title = "Roasted Salted Cashews",
                CategoryId = snacksCategory.Id,
                SubcategoryId = "sub-nuts",
                Price = 650,
                Image = Img("Cashews"),
                Rating = 4.6,
                ReviewCount = 31,
                Description = "Whole jumbo cashews slow-roasted and tossed with Himalayan pink salt.",
                Volume = "200 g",
                Origin = "Nepal",
                RewardCoins = 3,
                PhysicalStock = 100,
                AgeRestricted = false,
                Details = new List<ProductDetail>
                {
                    new() { Label = "Weight", Value = "200g" }
                }
            },
            new()
            {
                Id = "p-7",
                Slug = "craft-tonic-water-4pack",
                Title = "Craft Tonic Water 4-Pack",
                CategoryId = coldDrinksCategory.Id,
                SubcategoryId = "sub-mixers",
                Price = 600,
                Image = Img("Tonic Water"),
                Rating = 4.4,
                ReviewCount = 28,
                Description = "Botanical tonic brewed with natural quinine and spring water for crisp mixed drinks.",
                Volume = "4 x 200 ml",
                Origin = "UK",
                RewardCoins = 3,
                PhysicalStock = 100,
                AgeRestricted = false,
                Details = new List<ProductDetail>
                {
                    new() { Label = "Pack", Value = "4 cans" }
                }
            },
            new()
            {
                Id = "p-8",
                Slug = "sparkling-mineral-water",
                Title = "Italian Sparkling Mineral Water",
                CategoryId = coldDrinksCategory.Id,
                SubcategoryId = "sub-water",
                Price = 220,
                Image = Img("Sparkling Water"),
                Rating = 4.8,
                ReviewCount = 45,
                Description = "Naturally carbonated mineral water with fine bubbles from Italian alpine springs.",
                Volume = "750 ml",
                Origin = "Italy",
                RewardCoins = 1,
                PhysicalStock = 100,
                AgeRestricted = false,
                Details = new List<ProductDetail>
                {
                    new() { Label = "Bottle", Value = "Glass 750ml" }
                }
            }
        };

        await context.Products.AddRangeAsync(products);

        // 7. Seed Delivery Areas
        var deliveryAreas = new List<DeliveryArea>
        {
            new() { Id = "area-jhamsikhel", Name = "Jhamsikhel", City = "Lalitpur", StandardEtaMinutes = 35, ExpressEtaMinutes = 15, IsExpressAvailable = true, IsActive = true },
            new() { Id = "area-pulchowk", Name = "Pulchowk", City = "Lalitpur", StandardEtaMinutes = 35, ExpressEtaMinutes = 15, IsExpressAvailable = true, IsActive = true },
            new() { Id = "area-patandhoka", Name = "Patan Dhoka", City = "Lalitpur", StandardEtaMinutes = 40, ExpressEtaMinutes = 20, IsExpressAvailable = true, IsActive = true },
            new() { Id = "area-thamel", Name = "Thamel", City = "Kathmandu", StandardEtaMinutes = 30, ExpressEtaMinutes = 15, IsExpressAvailable = true, IsActive = true },
            new() { Id = "area-durbarmarg", Name = "Durbar Marg", City = "Kathmandu", StandardEtaMinutes = 30, ExpressEtaMinutes = 15, IsExpressAvailable = true, IsActive = true },
            new() { Id = "area-baluwatar", Name = "Baluwatar", City = "Kathmandu", StandardEtaMinutes = 40, ExpressEtaMinutes = 20, IsExpressAvailable = true, IsActive = true },
            new() { Id = "area-hattisar", Name = "Hattisar", City = "Kathmandu", StandardEtaMinutes = 35, ExpressEtaMinutes = 15, IsExpressAvailable = true, IsActive = true },
            new() { Id = "area-chabahil", Name = "Chabahil", City = "Kathmandu", StandardEtaMinutes = 45, ExpressEtaMinutes = 25, IsExpressAvailable = true, IsActive = true }
        };

        await context.DeliveryAreas.AddRangeAsync(deliveryAreas);
        await context.SaveChangesAsync();
    }
}
