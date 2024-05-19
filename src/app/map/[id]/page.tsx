import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "~/server/db";
import { maps } from "~/server/db/schema";
import MapViewer from "./mapViewer";
import { roomsValidator } from "./roomsValidator";

export default async function Map({ params }: { params: { id: string } }) {
    const id = Number(params.id);
    if (!Number.isFinite(id) || Number.isNaN(id)) {
        notFound();
    }

    const map = await db.query.maps.findFirst({
        where: eq(maps.id, Number(id)),
    });
    if (!map) {
        notFound();
    }

    let rooms;
    try {
        rooms = roomsValidator.parse(JSON.parse(map.map));
    } catch (err) {
        return <p className="text-center">Error occured while parsing the map.</p>;
    }

    return (
        <div className="space-y-5">
            <p>Map: {map.name}</p>
            <div>
                <p>Bounding box dimensions:</p>
                <div className="space-x-5">
                    <span>Width: {map.width}</span>
                    <span>Height: {map.height}</span>
                    <span>Height / Width: {map.height / map.width}</span>
                </div>
            </div>
            <div>
                <MapViewer rooms={rooms}/>
            </div>
        </div>
    );
}