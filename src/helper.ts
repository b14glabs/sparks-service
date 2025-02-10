import { appendFileSync, writeFileSync } from "fs"
import { SNAPSHOT_MIN_UTC_HOUR, SNAPSHOT_TO_UTC_HOUR } from "./const"
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

function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export const sleepTimeToNextSnapshot = (savedToday = false) => {
    const current = new Date()
    const nextSnapshot = new Date()
    if (savedToday) {
        nextSnapshot.setUTCDate(current.getUTCDate() + 1)
        nextSnapshot.setUTCHours(randomInt(SNAPSHOT_MIN_UTC_HOUR, SNAPSHOT_TO_UTC_HOUR), randomInt(0, 60), 0, 0)
    } else {
        nextSnapshot.setUTCHours(randomInt(Math.max(current.getUTCHours() + 1, SNAPSHOT_MIN_UTC_HOUR), SNAPSHOT_TO_UTC_HOUR), randomInt(0, 60), 0, 0)

    }
    console.log(`Sleep to ${nextSnapshot.toISOString()}`)
    return nextSnapshot.getTime() - current.getTime()
}