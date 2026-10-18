import type { ComponentProps } from "react"
import { DayPicker } from "react-day-picker"
import type { ChevronProps } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons"

export type CalendarProps = ComponentProps<typeof DayPicker>

const NAV_BUTTON = cn(
  buttonVariants({ variant: "outline" }),
  "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-700 border-gray-200 dark:border-zinc-700"
)

// Fuera del componente: definido dentro, React lo vería como un componente nuevo en cada render
const Chevron = ({ orientation, className, style }: ChevronProps) => {
  const Icon = orientation === "right" ? ChevronRightIcon : ChevronLeftIcon
  return <Icon className={cn("h-4 w-4", className)} style={style} />
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "relative flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        month_caption: "flex h-6 items-center justify-center",
        caption_label: "text-sm font-medium",
        nav: "absolute inset-x-0 top-0 flex h-6 items-center justify-between px-1",
        button_previous: NAV_BUTTON,
        button_next: NAV_BUTTON,
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday:
          "text-gray-500 dark:text-gray-400 rounded-md w-8 font-normal text-[0.8rem]",
        week: "flex w-full mt-2",
        day: "group relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 font-normal text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-700 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:opacity-50 group-aria-selected:bg-green-600 group-aria-selected:text-white hover:group-aria-selected:bg-green-500 group-data-[today=true]:bg-gray-100 dark:group-data-[today=true]:bg-zinc-700"
        ),
        outside: "text-muted-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{ Chevron }}
      {...props} />
  )
}

export { Calendar }
