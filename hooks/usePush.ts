"use client"

import { useState, useEffect } from "react"

const alertMessage =
  "Notifications Blocked\n\n" +
  "To enable notifications:\n\n" +
  "macOS:\n" +
  "System Settings → Notifications → Your Browser → Turn ON\n\n" +
  "Windows:\n" +
  "Settings → System → Notifications → Your Browser → Turn ON\n\n" +
  "Brave Browser Users:\n" +
  "Settings → Privacy and security → Check 'Use Google services for push messaging'\n" +
  "Then relaunch your browser\n\n" +
  "After updating settings, refresh this page and try again."

type UsePushNotificationsReturn = {
  isSupported: boolean
  subscription: PushSubscription | null
  isRegistering: boolean
  subscribeToPush: () => Promise<void>
  unsubscribeFromPush: () => Promise<void>
  sendTestNotification: () => Promise<void>
}

export const usePush = (): UsePushNotificationsReturn => {
  const [isSupported, setIsSupported] = useState<boolean>(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [isRegistering, setIsRegistering] = useState<boolean>(false)

  const registerServiceWorker = async (): Promise<void> => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js")

      const existingSub = await registration.pushManager.getSubscription()
      setSubscription(existingSub)
    } catch (error) {
      console.error("Service Worker registration failed:", error)
      alert(alertMessage)
    }
  }

  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true)
      registerServiceWorker()
    }
  }, [])

  const subscribeToPush = async (): Promise<void> => {
    try {
      setIsRegistering(true)
      const registration = await navigator.serviceWorker.ready

      const permission = await Notification.requestPermission()
      if (permission !== "granted") {
        alert(alertMessage)
        setIsRegistering(false)
        return
      }

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ) as any,
      })

      setSubscription(sub)

      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      })

      setIsRegistering(false)
    } catch (error) {
      alert(alertMessage)
      console.error("Failed to subscribe:", error)
      setIsRegistering(false)
    }
  }

  const unsubscribeFromPush = async (): Promise<void> => {
    try {
      if (subscription) {
        await subscription.unsubscribe()
        setSubscription(null)
      }
    } catch (error) {
      alert(alertMessage)
      console.error("Failed to unsubscribe:", error)
    }
  }

  const sendTestNotification = async (): Promise<void> => {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready
      await registration.showNotification("Test Notification", {
        body: "This is a test push notification!",
        icon: "/apple-icon-180x180.png",
        tag: "jobscraper",
        data: {
          dateOfArrival: Date.now(),
          primaryKey: 1,
        },
      })
    }
  }

  return {
    isSupported,
    subscription,
    isRegistering,
    subscribeToPush,
    unsubscribeFromPush,
    sendTestNotification,
  }
}
