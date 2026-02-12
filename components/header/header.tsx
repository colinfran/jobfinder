import { FC } from "react"
import HeaderDropdown from "./header-dropdown"
import Link from "next/link"
import Icon from "../icon"

const Header: FC = async () => {
  return (
    <header className="sticky top-0 z-30 flex h-[50px] items-center gap-4 border-b bg-background px-4 sm:static sm:border-0 sm:bg-transparent sm:px-6">
      <Link className="flex flex-row w-full gap-4 items-center" href="/">
        <Icon />
        <div>JobScaper</div>
      </Link>
      <HeaderDropdown />
    </header>
  )
}

export default Header
