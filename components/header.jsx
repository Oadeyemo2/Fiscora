import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import Link from "next/link"
import Image from "next/image";
import { Button } from './ui/button';
import { PenBox, LayoutDashboard, Landmark, Bot, Tags, Bell, Trophy, ShieldCheck } from "lucide-react";
import { checkUser } from "@/lib/checkUser";
import { ThemeToggle } from "./theme-toggle";


const Header = async () => {
  const user = await checkUser();
  const isAdmin = user?.role === "ADMIN";
  return (
    <div className='fixed top-0 w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md z-50 border-b'>

        <nav className='container mx-auto px-4 py-4 flex items-center justify-between'>
            <Link href='/' className='flex items-center gap-2' aria-label='Fiscora home'>
            <Image src="/fiscora-mark.svg" alt="" height={40} width={40} className="h-10 w-10" priority />
            <span className='text-2xl font-extrabold tracking-tight text-emerald-900 dark:text-emerald-300'>Fiscora</span>
            </Link>

            <div className='flex items-center space-x-2 md:space-x-3'>
            <SignedIn>
                {isAdmin && (
                <Link href="/admin" title="Admin">
                <Button variant="outline" className='flex items-center gap-2'>
                    <ShieldCheck size={18} />
                    <span className='hidden md:inline'>Admin</span>
                </Button>
                </Link>
                )}

                <Link href={isAdmin ? "/dashboard?view=me" : "/dashboard"}>
                <Button variant= "outline" className='flex items-center gap-2'>
                    <LayoutDashboard size= {18} />
                    <span className='hidden md:inline'>Dashboard</span>
                </Button>
                </Link>

                <Link href="/loans" title="Loans">
                <Button variant="ghost" className='flex items-center gap-2'>
                    <Landmark size={18} />
                    <span className='hidden lg:inline'>Loans</span>
                </Button>
                </Link>

                <Link href="/advisor" title="AI Advisor">
                <Button variant="ghost" className='flex items-center gap-2'>
                    <Bot size={18} />
                    <span className='hidden lg:inline'>AI Advisor</span>
                </Button>
                </Link>

                <Link href="/rewards" title="Rewards">
                <Button variant="ghost" size="icon">
                    <Trophy size={18} />
                </Button>
                </Link>

                <Link href="/categories" title="Categories">
                <Button variant="ghost" size="icon">
                    <Tags size={18} />
                </Button>
                </Link>

                <Link href="/notifications" title="Notifications">
                <Button variant="ghost" size="icon">
                    <Bell size={18} />
                </Button>
                </Link>

                <Link href="/transaction/create" >
                <Button className='flex items-center gap-2'>
                    <PenBox size= {18} />
                    <span className='hidden md:inline'>Add transaction</span>
                </Button>
                </Link>

            </SignedIn>

            <ThemeToggle />

            <SignedOut>
              <SignInButton forceRedirectUrl='/dashboard'>
                <Button variant= "outline">Login</Button>
              </SignInButton>
              <SignUpButton forceRedirectUrl='/dashboard'>
                <Button variant= "outline">
                    Sign-up
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                },
              }}
            />            </SignedIn>
            </div>
        </nav>
            </div>
  )
}

export default Header
