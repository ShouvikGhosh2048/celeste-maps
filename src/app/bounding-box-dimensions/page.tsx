// https://nextjs.org/learn/dashboard-app/adding-search-and-pagination

import { db } from "~/server/db";
import Table from "./table";
import { asc, desc, like, sql } from "drizzle-orm";
import { maps } from "~/server/db/schema";

type Order = 'asc' | 'desc';
type Column = 'name' | 'width' | 'height' | 'heightbywidth';

export default async function BoundingBoxDimensions({
    searchParams
}: {
    searchParams: {
        name?: string,
        page?: string,
        columnAndOrder?: string,
    }
}) {
    const name = searchParams.name ?? '';
    let page = Number(searchParams.page);
    if (!Number.isInteger(page) || page < 1) {
        page = 1;
    }

    let [column, order] = (searchParams.columnAndOrder ?? 'name-asc').split('-');
    if (column !== 'width' && column !== 'height' && column !== 'heightbywidth') {
        column = 'name';
    }
    if (order !== 'desc') {
        order = 'asc';
    }

    const numberOfRows = (await db.select({
        count: sql<number>`count(*)`,
    }).from(maps)
    .where(like(maps.name, `%${name}%`)))[0]?.count ?? 0;
    const numberOfPages = Math.ceil(numberOfRows / 50);
    if (page > numberOfPages) {
        page = numberOfPages; // Note: page will be 0 if there are no rows. Consider other possibilities?
    }

    let orderBy;
    switch (column) {
        case 'name':
            if (order === 'asc') {
                orderBy = [asc(maps.name)];
            } else {
                orderBy = [desc(maps.name)];
            }
            break;
        case 'width':
            if (order === 'asc') {
                orderBy = [asc(maps.width)];
            } else {
                orderBy = [desc(maps.width)];
            }
            break;
        case 'height':
            if (order === 'asc') {
                orderBy = [asc(maps.height)];
            } else {
                orderBy = [desc(maps.height)];
            }
            break;
        case 'heightbywidth':
            if (order === 'asc') {
                orderBy = sql`CAST(height AS REAL) / CAST(width AS REAL) asc`;
            } else {
                orderBy = sql`CAST(height AS REAL) / CAST(width AS REAL) desc`;
            }
            break;
    }

    const rows = await db.query.maps.findMany({
        columns: {
            id: true,
            name: true,
            width: true,
            height: true,
        },
        limit: 50,
        offset: 50 * (page - 1),
        orderBy,
        where: like(maps.name, `%${name}%`)
    });

    return (
        <div className="w-fit mx-auto">
            <p className="font-bold text-xl mb-5">Bounding box</p>
            <Table name={name} page={page} numberOfPages={numberOfPages} initialColumn={column as Column} initialOrder={order as Order} rows={rows}/>
        </div>
    );
}