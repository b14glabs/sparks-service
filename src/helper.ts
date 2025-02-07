import { appendFileSync, writeFileSync } from "fs"
import { SNAPSHOT_UTC_HOUR } from "./const"
import { ISparksPoint } from "./models"

export function log(content: any, persist = true) {
    try {
        console.log(content)
        if (persist) {
            appendFileSync("./volumes/log.txt", `\n${new Date().toISOString()}: ${JSON.stringify(content)}`, {
                encoding: "utf8"
            })
        }
    } catch (error) {
        console.error("Log error", error)
    }
}

export function backup(data: ISparksPoint[]) {
    try {
        const date = new Date()
        writeFileSync(`./volumes/backup_${date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).replace(/[\/:,\s]/g, '_')}.json`, JSON.stringify(data), "utf-8")
    } catch (error) {
        log(error)
    }
}

export const sleepTimeToNextSnapshot = () => {
    const current = new Date()
    const nextSnapshot = new Date()
    if (current.getUTCHours() > SNAPSHOT_UTC_HOUR) {
        nextSnapshot.setDate(current.getUTCDate() + 1)
    }
    nextSnapshot.setUTCHours(SNAPSHOT_UTC_HOUR, 0, 0, 0)
    return nextSnapshot.getTime() - current.getTime()
}