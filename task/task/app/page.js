import Image from "next/image";
import { Task } from "@/components/component/task"
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export default function Home() {
  return (
    <Task/>
  );
}
