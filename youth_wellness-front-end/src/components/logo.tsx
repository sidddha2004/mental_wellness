import Link from "next/link";
import { type SVGProps } from "react";

const LotusIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width="1em"
      height="1em"
      {...props}
    >
      <path
        fill="currentColor"
        d="M232 104a8 8 0 0 0-10.6-5.17C210.69 104.38 192 112 192 128c0 19.33 32 32 32 32s32-12.67 32-32a23.93 23.93 0 0 0-7-16.83A8 8 0 0 0 232 104Zm-48-2.61c-13-4.34-32.67-13.78-48-37.88C120.67 40.51 101.05 13.51 96 8a8 8 0 0 0-14 9.1c5.48 21.6 24.1 52.4 42.6 74.88C141.33 114.22 161 123.66 174 128Z"
      />
      <path
        fill="currentColor"
        d="M128 136a8 8 0 0 0-8 8v88a8 8 0 0 0 16 0v-88a8 8 0 0 0-8-8Zm-60.6-34.67C52.28 92.54 32.36 59.4 25.13 35.17A8 8 0 0 0 10.87 44.83C32.12 96.53 64 128 64 128s29.8-7.39 42-20.6Z"
      />
      <path
        fill="currentColor"
        d="M64 128c0 19.33-32 32-32 32s-32-12.67-32-32a23.93 23.93 0 0 1 7-16.83A8 8 0 1 0 18.6 104C10.69 109.13 0 118.62 0 128c0 24.81 38.6 48 64 48s64-23.19 64-48-28.69-38.87-36.6-43.17a8 8 0 1 0-8.8 13.34C96 104.38 64 115.33 64 128Z"
      />
    </svg>
  );
  

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="Zenith Home">
      <div className="rounded-full bg-primary/10 p-2">
        <LotusIcon className="h-6 w-6 text-primary" />
      </div>
      <span className="text-xl font-bold font-headline text-foreground tracking-tight">
        Zenith
      </span>
    </Link>
  );
}
