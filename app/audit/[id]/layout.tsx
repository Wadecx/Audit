export default function AuditLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 overflow-hidden bg-[#0a0a0f]">
      {children}
    </div>
  );
}
