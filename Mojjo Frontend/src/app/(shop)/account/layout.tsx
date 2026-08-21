import { AccountSidebar } from "@/components/account/account-sidebar";

export default function AccountLayout({ children }: LayoutProps<"/account">) {
  return (
    <div className="container-page py-8 sm:py-10">
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
        <aside className="w-full shrink-0 lg:w-64">
          <div className="lg:sticky lg:top-32">
            <AccountSidebar />
          </div>
        </aside>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
