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
        label: "Serper credits run out in",
        message: `${daysLeft} days`,
        color: getBadgeColor(daysLeft),
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
        schemaVersion: 1,
        label: "Serper credits run out in",
        message: "error",
        color: "lightgrey",
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
