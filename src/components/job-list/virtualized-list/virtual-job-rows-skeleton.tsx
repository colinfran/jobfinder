import { FC } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export const VirtualJobRowsSkeleton: FC = () => {
  return <Skeleton aria-hidden="true" className="h-full w-full rounded-none" />
}
