import Link from "next/link";
import { Music, FileText, PenTool, BookOpen, HelpCircle } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar */}
      <aside className="w-[260px] bg-pure-white border-r border-border shrink-0 sticky top-0 h-screen overflow-y-auto hidden lg:flex flex-col">
        {/* Brand */}
        <div className="px-6 py-5 border-b border-border">
          <Link href="/admin/articles" className="no-underline flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-charcoal flex items-center justify-center">
              <Music size={18} className="text-white" />
            </div>
            <div>
              <div className="text-heading text-[15px] font-bold tracking-tight">
                Müzik Blog
              </div>
              <div className="text-muted text-[10px] font-semibold tracking-widest uppercase">
                Yönetim Paneli
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <div className="label text-muted px-3 mb-2">İÇERİK</div>
          <Link
            href="/admin/articles"
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium text-secondary hover:text-heading hover:bg-surface transition-all no-underline"
          >
            <FileText size={15} strokeWidth={1.5} />
            Makaleler
          </Link>
          <Link
            href="/admin/articles/new"
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium text-secondary hover:text-heading hover:bg-surface transition-all no-underline"
          >
            <PenTool size={15} strokeWidth={1.5} />
            Yeni Makale
          </Link>

          <div className="label text-muted px-3 mb-2 mt-6">GÖRÜNTÜLE</div>
          <Link
            href="/articles"
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium text-secondary hover:text-heading hover:bg-surface transition-all no-underline"
          >
            <BookOpen size={15} strokeWidth={1.5} />
            Public Blog
          </Link>

          <div className="label text-muted px-3 mb-2 mt-6">YARDIM</div>
          <Link
            href="/admin/guide"
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium text-secondary hover:text-heading hover:bg-surface transition-all no-underline"
          >
            <HelpCircle size={15} strokeWidth={1.5} />
            Editör Rehberi
          </Link>
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border">
          <p className="text-[10px] text-muted font-medium">
            Müzik Eğitimi Blog Sistemi
          </p>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-pure-white border-b border-border px-4 py-3 flex items-center justify-between">
        <Link href="/admin/articles" className="no-underline flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-charcoal flex items-center justify-center">
            <Music size={14} className="text-white" />
          </div>
          <span className="text-heading text-[14px] font-bold">Müzik Blog</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/admin/articles" className="p-2 text-muted hover:text-heading no-underline">
            <FileText size={16} />
          </Link>
          <Link href="/admin/articles/new" className="p-2 text-muted hover:text-heading no-underline">
            <PenTool size={16} />
          </Link>
          <Link href="/admin/guide" className="p-2 text-muted hover:text-heading no-underline">
            <HelpCircle size={16} />
          </Link>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 min-w-0 lg:px-10 lg:py-8 px-4 py-4 pt-16 lg:pt-8">
        <div className="max-w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
