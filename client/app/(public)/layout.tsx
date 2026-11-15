import { PublicHeader } from '@/src/components/public-header';
import { PublicFooter } from '@/src/components/public-footer';
export default function PublicLayout({ children }: { children: React.ReactNode }) { return <><PublicHeader/><main className="min-h-[60vh]">{children}</main><PublicFooter/></>; }
