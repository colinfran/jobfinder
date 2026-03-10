import { getCreditBalance } from "@/app/(routes)/about/action"
import { auth } from "@/lib/auth/auth"
import { db } from "@/lib/db"
import { user } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

type DonateToastDataResponse = {
  daysLeft: number | null
  isAdmin: boolean
}

export const GET = async (): Promise<NextResponse<DonateToastDataResponse>> => {
  try {
    const session = await auth.api.getSession({ headers: await headers() })

    const [currentUser] = session?.user?.id
      ? await db
          .select({ isAdmin: user.isAdmin })
          .from(user)
          .where(eq(user.id, session.user.id))
          .limit(1)
      : []

    const daysLeft = await getCreditBalance()

    return NextResponse.json(
      {
        daysLeft,
        isAdmin: Boolean(currentUser?.isAdmin),
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    )
  } catch {
    return NextResponse.json(
      {
        daysLeft: null,
        isAdmin: false,
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    )
  }
}
