# Mojjo Backend (.NET 10 Clean Architecture & Enterprise Hardened)

Enterprise-grade ASP.NET Core Web API for Mojjo Express Delivery & E-Commerce built with .NET 10, Entity Framework Core, SQL Server, ASP.NET Core Identity, JWT Bearer Authentication, Role-Based Access Control (RBAC), OWASP Top 10 API Security, Server-Side Payment Verification (eSewa & Khalti), and High-Concurrency Inventory Management with Overselling Protection.

---

## 🏛️ Architecture & Folderization

```
Mojjo Backend/
├── Mojjo.slnx                   # Solution file
└── src/
    ├── 🌐 Mojjo.Domain/         # Core business entities, enums, domain models (Zero dependencies)
    │   ├── Common/              # BaseEntity (Id, CreatedAt, UpdatedAt)
    │   ├── Constants/           # AppRoles (Customer, Admin, Manager, DeliveryAgent, Seller)
    │   ├── Entities/            # ApplicationUser, Product, Order, OrderItem, ShippingAddress,
    │   │                        # OrderStatusHistory, PaymentTransaction, StockReservation, StockAdjustmentLog...
    │   └── Enums/               # OrderStatus, DeliveryMethod, PaymentMethod, PaymentStatus, StockReservationStatus...
    │
    ├── ⚙️ Mojjo.Application/    # Business logic, FluentValidation, DTOs, service interfaces & implementations
    │   ├── Common/              # ApiResponse<T>, PagedResult<T>, Exceptions, InputSanitizer
    │   ├── DTOs/                # Auth, Categories, Delivery, Inventory, Notifications, Orders, Payments, Products, Rewards, Users
    │   ├── Interfaces/          # IIdentityService, ITokenService, IInventoryService, IPaymentService, IProductService...
    │   ├── Services/            # CategoryService, DeliveryService, InventoryService, NotificationService, OrderService, ProductService, RewardService
    │   └── Validators/          # RegisterRequestValidator, LoginRequestValidator, CreateOrderRequestValidator, PaymentValidators
    │
    ├── 🗄️ Mojjo.Infrastructure/ # Persistence, Identity, External Gateways, & Repositories
    │   ├── Persistence/         # MojjoDbContext (IdentityDbContext applying configurations from assembly)
    │   ├── Persistence/Configurations/ # Fluent API Entity Configurations (Product, Category, Order, Stock, Payment...)
    │   ├── Identity/            # IdentityService (PBKDF2 hashing, Lockout), TokenService (JWT + Refresh rotation)
    │   ├── Payments/            # EsewaPaymentGateway (HMAC-SHA256), KhaltiPaymentGateway (v2 REST), PaymentService
    │   ├── Services/            # InventoryService (Atomic concurrency, reservation lifecycle, audit logging)
    │   └── Seeding/             # DatabaseSeeder (Seeds roles, admin account, products, categories & areas)
    │
    └── 🚀 Mojjo.Api/            # ASP.NET Core Web API host (OWASP Hardened)
        ├── Controllers/         # Versioned Web API Controllers (api/v1/...)
        │   ├── AuthController.cs, CategoriesController.cs, DeliveryController.cs,
        │   ├── InventoryController.cs, NotificationsController.cs, OrdersController.cs,
        │   ├── PaymentsController.cs, ProductsController.cs, RewardsController.cs,
        │   └── Admin/UsersAdminController.cs
        ├── Extensions/          # ServiceCollectionExtensions, RateLimitingExtensions
        ├── Middleware/          # GlobalExceptionHandlerMiddleware, SecurityHeadersMiddleware
        ├── Program.cs           # Kestrel Request Limits, HSTS, Rate Limiting, CORS, DI, Pipeline
        └── appsettings.json     # Connection strings, JwtSettings, PaymentSettings, CORS origins
```

---

## 📦 Inventory Management & Overselling Protection

### 1. Real-Time Stock State Breakdown:
- **`PhysicalStock`**: Total units physically present in warehouse / dark store.
- **`ReservedStock`**: Units currently held in active checkouts and pending payments.
- **`SoldStock`**: Units committed from completed, confirmed orders.
- **`AvailableStock`**: `Math.Max(0, PhysicalStock - ReservedStock - SoldStock)`
- **`LowStock`**: Flag when `AvailableStock <= LowStockThreshold` (default 5 units).
- **`OutOfStock`**: Flag when `AvailableStock <= 0`.

### 2. Concurrency & Race Condition Elimination:
- **Atomic Database Locks**: When two simultaneous requests attempt to purchase the last unit (`Stock = 1`), atomic conditional checks enforce that only one customer succeeds; the other is rejected with `400 Bad Request` ("Insufficient stock available").
- **Optimistic Concurrency Control (`RowVersion`)**: EF Core timestamp tokens ensure conflicting writes are intercepted and resolved without data corruption.

### 3. Stock Reservation Lifecycle:
- **Order Placement**: Moves stock from `Available` to `Reserved` for 20 minutes (`ReservedStock += Quantity`).
- **Payment Success / Delivery Complete**: Converts reserved stock to `Sold` (`ReservedStock -= Quantity`, `SoldStock += Quantity`).
- **Order Cancelled / Timeout**: Releases reserved stock back to `Available` (`ReservedStock -= Quantity`).

---

## 🚀 Quick Start

### 1. Build the Solution
```bash
dotnet build Mojjo.slnx
```

### 2. Run the API
```bash
dotnet run --project src/Mojjo.Api
```

### 3. Swagger UI
- Open: [http://localhost:5177](http://localhost:5177) or [https://localhost:7065](https://localhost:7065)
- All v1 endpoints are documented with JWT Bearer authentication support.
