IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE TABLE [AspNetRoles] (
        [Id] nvarchar(450) NOT NULL,
        [Description] nvarchar(max) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [Name] nvarchar(256) NULL,
        [NormalizedName] nvarchar(256) NULL,
        [ConcurrencyStamp] nvarchar(max) NULL,
        CONSTRAINT [PK_AspNetRoles] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE TABLE [AspNetUsers] (
        [Id] nvarchar(450) NOT NULL,
        [FullName] nvarchar(max) NULL,
        [AvatarUrl] nvarchar(max) NULL,
        [RewardCoinBalance] int NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        [UserName] nvarchar(256) NULL,
        [NormalizedUserName] nvarchar(256) NULL,
        [Email] nvarchar(256) NULL,
        [NormalizedEmail] nvarchar(256) NULL,
        [EmailConfirmed] bit NOT NULL,
        [PasswordHash] nvarchar(max) NULL,
        [SecurityStamp] nvarchar(max) NULL,
        [ConcurrencyStamp] nvarchar(max) NULL,
        [PhoneNumber] nvarchar(max) NULL,
        [PhoneNumberConfirmed] bit NOT NULL,
        [TwoFactorEnabled] bit NOT NULL,
        [LockoutEnd] datetimeoffset NULL,
        [LockoutEnabled] bit NOT NULL,
        [AccessFailedCount] int NOT NULL,
        CONSTRAINT [PK_AspNetUsers] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE TABLE [Categories] (
        [Id] nvarchar(450) NOT NULL,
        [Slug] nvarchar(450) NOT NULL,
        [Name] nvarchar(max) NOT NULL,
        [Description] nvarchar(max) NOT NULL,
        [Icon] nvarchar(max) NOT NULL,
        [Banner] nvarchar(max) NULL,
        [DisplayOrder] int NOT NULL,
        [IsActive] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_Categories] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE TABLE [DeliveryAreas] (
        [Id] nvarchar(450) NOT NULL,
        [Name] nvarchar(450) NOT NULL,
        [City] nvarchar(max) NOT NULL,
        [StandardEtaMinutes] int NOT NULL,
        [ExpressEtaMinutes] int NOT NULL,
        [IsExpressAvailable] bit NOT NULL,
        [IsActive] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_DeliveryAreas] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE TABLE [AspNetRoleClaims] (
        [Id] int NOT NULL IDENTITY,
        [RoleId] nvarchar(450) NOT NULL,
        [ClaimType] nvarchar(max) NULL,
        [ClaimValue] nvarchar(max) NULL,
        CONSTRAINT [PK_AspNetRoleClaims] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_AspNetRoleClaims_AspNetRoles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [AspNetRoles] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE TABLE [AspNetUserClaims] (
        [Id] int NOT NULL IDENTITY,
        [UserId] nvarchar(450) NOT NULL,
        [ClaimType] nvarchar(max) NULL,
        [ClaimValue] nvarchar(max) NULL,
        CONSTRAINT [PK_AspNetUserClaims] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_AspNetUserClaims_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE TABLE [AspNetUserLogins] (
        [LoginProvider] nvarchar(450) NOT NULL,
        [ProviderKey] nvarchar(450) NOT NULL,
        [ProviderDisplayName] nvarchar(max) NULL,
        [UserId] nvarchar(450) NOT NULL,
        CONSTRAINT [PK_AspNetUserLogins] PRIMARY KEY ([LoginProvider], [ProviderKey]),
        CONSTRAINT [FK_AspNetUserLogins_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE TABLE [AspNetUserRoles] (
        [UserId] nvarchar(450) NOT NULL,
        [RoleId] nvarchar(450) NOT NULL,
        CONSTRAINT [PK_AspNetUserRoles] PRIMARY KEY ([UserId], [RoleId]),
        CONSTRAINT [FK_AspNetUserRoles_AspNetRoles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [AspNetRoles] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_AspNetUserRoles_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE TABLE [AspNetUserTokens] (
        [UserId] nvarchar(450) NOT NULL,
        [LoginProvider] nvarchar(450) NOT NULL,
        [Name] nvarchar(450) NOT NULL,
        [Value] nvarchar(max) NULL,
        CONSTRAINT [PK_AspNetUserTokens] PRIMARY KEY ([UserId], [LoginProvider], [Name]),
        CONSTRAINT [FK_AspNetUserTokens_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE TABLE [Notifications] (
        [Id] nvarchar(450) NOT NULL,
        [UserId] nvarchar(450) NULL,
        [Title] nvarchar(max) NOT NULL,
        [Message] nvarchar(max) NOT NULL,
        [Type] nvarchar(max) NOT NULL,
        [Link] nvarchar(max) NULL,
        [IsRead] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_Notifications] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Notifications_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE TABLE [Orders] (
        [Id] nvarchar(450) NOT NULL,
        [OrderNumber] nvarchar(450) NOT NULL,
        [UserId] nvarchar(450) NULL,
        [Status] int NOT NULL,
        [PaymentStatus] int NOT NULL,
        [DeliveryMethod] int NOT NULL,
        [PaymentMethod] int NOT NULL,
        [Subtotal] decimal(18,2) NOT NULL,
        [DeliveryFee] decimal(18,2) NOT NULL,
        [DiscountAmount] decimal(18,2) NOT NULL,
        [Total] decimal(18,2) NOT NULL,
        [EarnedCoins] int NOT NULL,
        [ConfirmedAt] datetime2 NULL,
        [PreparingAt] datetime2 NULL,
        [OutForDeliveryAt] datetime2 NULL,
        [DeliveredAt] datetime2 NULL,
        [CancelledAt] datetime2 NULL,
        [CancellationReason] nvarchar(max) NULL,
        [EstimatedArrival] datetime2 NULL,
        [DeliveryAgentId] nvarchar(max) NULL,
        [DeliveryAgentName] nvarchar(max) NULL,
        [DeliveryAgentPhone] nvarchar(max) NULL,
        [Shipping_FullName] nvarchar(max) NOT NULL,
        [Shipping_Phone] nvarchar(max) NOT NULL,
        [Shipping_StreetAddress] nvarchar(max) NOT NULL,
        [Shipping_City] nvarchar(max) NOT NULL,
        [Shipping_Area] nvarchar(max) NOT NULL,
        [Shipping_Landmark] nvarchar(max) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_Orders] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Orders_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE SET NULL
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE TABLE [RefreshTokens] (
        [Id] nvarchar(450) NOT NULL,
        [UserId] nvarchar(450) NOT NULL,
        [Token] nvarchar(450) NOT NULL,
        [JwtId] nvarchar(max) NOT NULL,
        [IsUsed] bit NOT NULL,
        [IsRevoked] bit NOT NULL,
        [ExpiryDate] datetime2 NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_RefreshTokens] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_RefreshTokens_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE TABLE [RewardCoinTransactions] (
        [Id] nvarchar(450) NOT NULL,
        [UserId] nvarchar(450) NOT NULL,
        [Amount] int NOT NULL,
        [Reason] nvarchar(max) NOT NULL,
        [Type] nvarchar(max) NOT NULL,
        [ReferenceOrderId] nvarchar(max) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_RewardCoinTransactions] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_RewardCoinTransactions_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE TABLE [UserAddresses] (
        [Id] nvarchar(450) NOT NULL,
        [UserId] nvarchar(450) NOT NULL,
        [Label] nvarchar(max) NOT NULL,
        [FullName] nvarchar(max) NOT NULL,
        [Phone] nvarchar(max) NOT NULL,
        [Address] nvarchar(max) NOT NULL,
        [Landmark] nvarchar(max) NULL,
        [IsDefault] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_UserAddresses] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_UserAddresses_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE TABLE [Subcategories] (
        [Id] nvarchar(450) NOT NULL,
        [Slug] nvarchar(450) NOT NULL,
        [Name] nvarchar(max) NOT NULL,
        [CategoryId] nvarchar(450) NOT NULL,
        [DisplayOrder] int NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_Subcategories] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Subcategories_Categories_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [Categories] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE TABLE [OrderStatusHistories] (
        [Id] nvarchar(450) NOT NULL,
        [OrderId] nvarchar(450) NOT NULL,
        [FromStatus] int NOT NULL,
        [ToStatus] int NOT NULL,
        [Note] nvarchar(max) NULL,
        [ChangedByUserId] nvarchar(max) NULL,
        [ChangedByName] nvarchar(max) NULL,
        [ChangedByRole] nvarchar(max) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_OrderStatusHistories] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_OrderStatusHistories_Orders_OrderId] FOREIGN KEY ([OrderId]) REFERENCES [Orders] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE TABLE [PaymentTransactions] (
        [Id] nvarchar(450) NOT NULL,
        [OrderId] nvarchar(450) NOT NULL,
        [UserId] nvarchar(450) NULL,
        [Gateway] int NOT NULL,
        [Amount] decimal(18,2) NOT NULL,
        [Currency] nvarchar(10) NOT NULL,
        [Status] int NOT NULL,
        [TransactionUuid] nvarchar(450) NOT NULL,
        [Pidx] nvarchar(450) NULL,
        [GatewayTransactionId] nvarchar(100) NULL,
        [VerifiedAt] datetime2 NULL,
        [GatewayResponseRaw] nvarchar(max) NULL,
        [FailureReason] nvarchar(max) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_PaymentTransactions] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_PaymentTransactions_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE SET NULL,
        CONSTRAINT [FK_PaymentTransactions_Orders_OrderId] FOREIGN KEY ([OrderId]) REFERENCES [Orders] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE TABLE [Products] (
        [Id] nvarchar(450) NOT NULL,
        [Slug] nvarchar(450) NOT NULL,
        [Title] nvarchar(max) NOT NULL,
        [CategoryId] nvarchar(450) NOT NULL,
        [SubcategoryId] nvarchar(450) NULL,
        [Price] decimal(18,2) NOT NULL,
        [OriginalPrice] decimal(18,2) NULL,
        [Image] nvarchar(max) NOT NULL,
        [Rating] float NOT NULL,
        [ReviewCount] int NOT NULL,
        [Badge] int NULL,
        [Description] nvarchar(max) NOT NULL,
        [Volume] nvarchar(max) NULL,
        [Origin] nvarchar(max) NULL,
        [RewardCoins] int NOT NULL,
        [AgeRestricted] bit NOT NULL,
        [PhysicalStock] int NOT NULL,
        [ReservedStock] int NOT NULL,
        [SoldStock] int NOT NULL,
        [LowStockThreshold] int NOT NULL,
        [RowVersion] rowversion NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_Products] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Products_Categories_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [Categories] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Products_Subcategories_SubcategoryId] FOREIGN KEY ([SubcategoryId]) REFERENCES [Subcategories] ([Id]) ON DELETE SET NULL
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE TABLE [OrderItems] (
        [Id] nvarchar(450) NOT NULL,
        [OrderId] nvarchar(450) NOT NULL,
        [ProductId] nvarchar(450) NULL,
        [ProductTitle] nvarchar(max) NOT NULL,
        [ProductSlug] nvarchar(max) NOT NULL,
        [ProductImage] nvarchar(max) NOT NULL,
        [UnitPrice] decimal(18,2) NOT NULL,
        [OriginalUnitPrice] decimal(18,2) NULL,
        [Quantity] int NOT NULL,
        [TotalPrice] decimal(18,2) NOT NULL,
        [RewardCoinsEarned] int NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_OrderItems] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_OrderItems_Orders_OrderId] FOREIGN KEY ([OrderId]) REFERENCES [Orders] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_OrderItems_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Products] ([Id]) ON DELETE SET NULL
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE TABLE [ProductDetails] (
        [Id] nvarchar(450) NOT NULL,
        [ProductId] nvarchar(450) NOT NULL,
        [Label] nvarchar(max) NOT NULL,
        [Value] nvarchar(max) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_ProductDetails] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_ProductDetails_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Products] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE TABLE [StockAdjustmentLogs] (
        [Id] nvarchar(450) NOT NULL,
        [ProductId] nvarchar(450) NOT NULL,
        [PreviousPhysicalStock] int NOT NULL,
        [NewPhysicalStock] int NOT NULL,
        [QuantityChanged] int NOT NULL,
        [Reason] int NOT NULL,
        [Note] nvarchar(max) NULL,
        [OperatorUserId] nvarchar(max) NULL,
        [OperatorName] nvarchar(max) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_StockAdjustmentLogs] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_StockAdjustmentLogs_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Products] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE TABLE [StockReservations] (
        [Id] nvarchar(450) NOT NULL,
        [OrderId] nvarchar(450) NOT NULL,
        [ProductId] nvarchar(450) NOT NULL,
        [Quantity] int NOT NULL,
        [Status] int NOT NULL,
        [ExpiresAt] datetime2 NOT NULL,
        [ReleasedAt] datetime2 NULL,
        [CommittedAt] datetime2 NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_StockReservations] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_StockReservations_Orders_OrderId] FOREIGN KEY ([OrderId]) REFERENCES [Orders] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_StockReservations_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Products] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE INDEX [IX_AspNetRoleClaims_RoleId] ON [AspNetRoleClaims] ([RoleId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [RoleNameIndex] ON [AspNetRoles] ([NormalizedName]) WHERE [NormalizedName] IS NOT NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE INDEX [IX_AspNetUserClaims_UserId] ON [AspNetUserClaims] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE INDEX [IX_AspNetUserLogins_UserId] ON [AspNetUserLogins] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE INDEX [IX_AspNetUserRoles_RoleId] ON [AspNetUserRoles] ([RoleId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE INDEX [EmailIndex] ON [AspNetUsers] ([NormalizedEmail]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [UserNameIndex] ON [AspNetUsers] ([NormalizedUserName]) WHERE [NormalizedUserName] IS NOT NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Categories_Slug] ON [Categories] ([Slug]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE INDEX [IX_DeliveryAreas_IsActive_Name] ON [DeliveryAreas] ([IsActive], [Name]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE INDEX [IX_Notifications_UserId_IsRead_CreatedAt] ON [Notifications] ([UserId], [IsRead], [CreatedAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE INDEX [IX_OrderItems_OrderId] ON [OrderItems] ([OrderId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE INDEX [IX_OrderItems_ProductId] ON [OrderItems] ([ProductId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Orders_OrderNumber] ON [Orders] ([OrderNumber]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE INDEX [IX_Orders_PaymentStatus] ON [Orders] ([PaymentStatus]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE INDEX [IX_Orders_Status_CreatedAt] ON [Orders] ([Status], [CreatedAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE INDEX [IX_Orders_UserId_CreatedAt] ON [Orders] ([UserId], [CreatedAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE INDEX [IX_OrderStatusHistories_OrderId_CreatedAt] ON [OrderStatusHistories] ([OrderId], [CreatedAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE INDEX [IX_PaymentTransactions_OrderId] ON [PaymentTransactions] ([OrderId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE INDEX [IX_PaymentTransactions_Pidx] ON [PaymentTransactions] ([Pidx]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE UNIQUE INDEX [IX_PaymentTransactions_TransactionUuid] ON [PaymentTransactions] ([TransactionUuid]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE INDEX [IX_PaymentTransactions_UserId] ON [PaymentTransactions] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE INDEX [IX_ProductDetails_ProductId] ON [ProductDetails] ([ProductId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE INDEX [IX_Products_Badge_Rating] ON [Products] ([Badge], [Rating]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE INDEX [IX_Products_CategoryId_Price] ON [Products] ([CategoryId], [Price]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE INDEX [IX_Products_CategoryId_Rating] ON [Products] ([CategoryId], [Rating]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE INDEX [IX_Products_CreatedAt] ON [Products] ([CreatedAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Products_Slug] ON [Products] ([Slug]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE INDEX [IX_Products_SubcategoryId] ON [Products] ([SubcategoryId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE UNIQUE INDEX [IX_RefreshTokens_Token] ON [RefreshTokens] ([Token]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE INDEX [IX_RefreshTokens_UserId_IsRevoked_ExpiryDate] ON [RefreshTokens] ([UserId], [IsRevoked], [ExpiryDate]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE INDEX [IX_RewardCoinTransactions_UserId_CreatedAt] ON [RewardCoinTransactions] ([UserId], [CreatedAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE INDEX [IX_StockAdjustmentLogs_CreatedAt] ON [StockAdjustmentLogs] ([CreatedAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE INDEX [IX_StockAdjustmentLogs_ProductId] ON [StockAdjustmentLogs] ([ProductId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE INDEX [IX_StockReservations_ExpiresAt] ON [StockReservations] ([ExpiresAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE INDEX [IX_StockReservations_OrderId_ProductId] ON [StockReservations] ([OrderId], [ProductId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE INDEX [IX_StockReservations_ProductId] ON [StockReservations] ([ProductId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE INDEX [IX_Subcategories_CategoryId] ON [Subcategories] ([CategoryId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE INDEX [IX_Subcategories_Slug] ON [Subcategories] ([Slug]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    CREATE INDEX [IX_UserAddresses_UserId_IsDefault] ON [UserAddresses] ([UserId], [IsDefault]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260821065834_InitialCreate_Identity_Catalog_Orders_Payments', N'10.0.11');
END;

COMMIT;
GO

