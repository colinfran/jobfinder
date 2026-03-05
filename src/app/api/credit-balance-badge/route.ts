import { getCreditBalance } from "@/app/(routes)/about/action"
import { NextResponse } from "next/server"

const getBadgeColor = (daysLeft: number): string => {
  if (daysLeft >= 30) {
    return "brightgreen"
  }

  if (daysLeft >= 14) {
    return "yellow"
  }

  return "red"
}

export const GET = async (): Promise<NextResponse> => {
  try {
    const daysLeft = await getCreditBalance()

    return NextResponse.json(
      {
        schemaVersion: 1,
        label: "serper days left",
        message: `${daysLeft} days`,
        color: getBadgeColor(daysLeft),
      },
      {
        headers: {
          "Cache-Control": "public, max-age=300, s-maxage=300",
        },
      },
    )
  } catch {
    return NextResponse.json(
      {
        schemaVersion: 1,
        label: "serper days left",
        message: "error",
        color: "lightgrey",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=60",
        },
      },
    )
  }
}
