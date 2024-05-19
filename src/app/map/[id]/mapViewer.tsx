"use client";

import { type z } from "zod";
import { type roomsValidator } from "./roomsValidator";
import { useEffect, useRef, useState } from "react";

function MapViewerCanvas({ rooms, closeCanvas }: { rooms: z.infer<typeof roomsValidator>, closeCanvas: () => void }) {
    const divRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const ctx = canvasRef.current!.getContext('2d')!;
        let position: [number, number] = [0, 0];
        let zoom = 1;
        let drag: null | {
            start: [number, number],
            initialPosition: [number, number]
        };
        const tileRectangles: { x: number, y: number, length: number }[] = [];
        rooms.forEach(room => {
            let tileX = room.x;
            let tileY = room.y;
            for (let i = 0; i < room.tiles.length; i++) {
                const tile = room.tiles[i];
                if (tile === '\n') {
                    tileX = room.x;
                    tileY += 8;
                } else if (tile === '0') {
                    tileX += 8;
                } else {
                    const rectangle = {
                        x: tileX,
                        y: tileY,
                        length: 8,
                    };
                    tileX += 8;
                    while (i < room.tiles.length - 1 && room.tiles[i+1] !== '0' && room.tiles[i+1] !== '\n') {
                        rectangle.length += 8;
                        i += 1;
                        tileX += 8;
                    }
                    tileRectangles.push(rectangle);
                }
            }
        });
        let xMin = Infinity;
        let yMin = Infinity;
        let xMax = -Infinity;
        let yMax = -Infinity;
        rooms.forEach(room => {
            xMin = Math.min(xMin, room.x);
            yMin = Math.min(yMin, room.y);
            xMax = Math.max(xMax, room.x + room.width);
            yMax = Math.max(yMax, room.y + room.height);
        });


        const drawCanvas = () => {
            const canvasWidth = window.innerWidth - 2;
            const canvasHeight = window.innerHeight - 2;
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            ctx.fillStyle = 'rgb(230, 230, 230)';
            ctx.fillRect(
                canvasWidth/2 + zoom * (xMin - position[0]),
                canvasHeight/2 + zoom * (yMin - position[1]),
                (xMax - xMin + 0.5) * zoom + 1,
                (yMax - yMin + 0.5) * zoom + 1
            );
            rooms.forEach(room => {
                ctx.fillStyle = 'rgb(200, 200, 200)';
                ctx.fillRect(
                    canvasWidth/2 + zoom * (room.x - position[0]),
                    canvasHeight/2 + zoom * (room.y - position[1]),
                    (room.width + 0.5) * zoom,
                    (room.height + 0.5) * zoom
                );
            });
            tileRectangles.forEach(rectangle => {
                ctx.fillStyle = 'black';
                ctx.fillRect(
                    canvasWidth/2 + zoom * (rectangle.x - position[0]),
                    canvasHeight/2 + zoom * (rectangle.y - position[1]),
                    (rectangle.length + 0.5) * zoom,
                    8.5 * zoom
                );
            });
        };

        const resizeCanvas = () => {
            canvasRef.current!.width = window.innerWidth - 2;
            canvasRef.current!.height = window.innerHeight - 2;
            drawCanvas();
        };

        const mouseDown = (e: MouseEvent) => {
            drag = {
                start: [e.pageX, e.pageY],
                initialPosition: position,
            };
        };

        const mouseMove = (e: MouseEvent) => {
            if (drag) {
                position = [
                    drag.initialPosition[0] + (drag.start[0] - e.pageX) / zoom,
                    drag.initialPosition[1] + (drag.start[1] - e.pageY) / zoom
                ];
                drawCanvas();
            }
        };

        const mouseUp = (e: MouseEvent) => {
            drag = null;
        };

        const mouseWheel = (e: WheelEvent) => {
            const newZoom = zoom / Math.pow(1.1, e.deltaY / 100);
            position = [
                position[0] + (e.pageX - window.innerWidth / 2) * (1 / zoom - 1 / newZoom),
                position[1] + (e.pageY - window.innerHeight / 2) * (1 / zoom - 1 / newZoom)
            ];
            zoom = newZoom;
            drawCanvas();
        }

        resizeCanvas();

        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('mousedown', mouseDown);
        window.addEventListener('mousemove', mouseMove);
        window.addEventListener('mouseup', mouseUp);
        window.addEventListener('wheel', mouseWheel); // Should this be on the canvas?
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousedown', mouseDown);
            window.removeEventListener('mousemove', mouseMove);
            window.removeEventListener('mouseup', mouseUp);
            window.removeEventListener('wheel', mouseWheel);
        };
    }, [rooms]);

    return (
        <div className="absolute w-screen h-screen z-10 top-0 left-0 bg-white m-0" ref={divRef}>
            <canvas width={500} height={500} className="border border-black" ref={canvasRef}/>
            <button className="absolute top-3 right-3 bg-slate-900 text-white w-7 h-7 rounded" onClick={closeCanvas}>X</button>
        </div>
    );
}

export default function MapViewer({ rooms }: { rooms: z.infer<typeof roomsValidator> }) {
    const [showCanvas, setShowCanvas] = useState(false);

    if (showCanvas) {
        return <MapViewerCanvas rooms={rooms} closeCanvas={() => { setShowCanvas(false); }}/>
    } else {
        return (
            <button onClick={() => { setShowCanvas(true); }} className="px-2 py-1 bg-slate-900 text-white rounded">View map</button>
        );
    }
}