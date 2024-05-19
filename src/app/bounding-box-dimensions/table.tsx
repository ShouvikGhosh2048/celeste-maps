"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useState, type ChangeEvent } from "react";
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaAngleLeft, FaAngleRight, FaArrowDown, FaArrowUp, FaArrowsAltV } from "react-icons/fa";
import { useDebouncedCallback } from "use-debounce";

type Order = 'asc' | 'desc';
type Column = 'name' | 'width' | 'height' | 'heightbywidth';

function OrderButton({ order, setOrder }: {
    order: Order | 'none',
    setOrder: (order: Order) => void,
}) {
    let icon;
    switch (order) {
        case 'none':
            icon = <FaArrowsAltV/>
            break;
        case 'asc':
            icon = <FaArrowUp/>
            break;
        case 'desc':
            icon = <FaArrowDown/>
            break;
    }
    return (
        <button onClick={() => {
            switch(order) {
                case 'none':
                    setOrder('asc');
                    break;
                case 'asc':
                    setOrder('desc');
                    break;
                case 'desc':
                    setOrder('asc');
                    break;
            }
        }} className={`border p-1 rounded ${order !== 'none' ? "bg-slate-900 text-white" : "bg-slate-300"}`}>
            {icon}
        </button>
    )
}

export default function Table({ name, rows, page, numberOfPages, initialOrder, initialColumn}: {
    name: string,
    page: number,
    numberOfPages: number,
    rows: {
        name: string,
        id: number,
        width: number,
        height: number,
    }[],
    initialOrder: Order,
    initialColumn: Column,
}) {
    const pathName = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();

    const [order, setOrder] = useState({
        column: initialColumn,
        order: initialOrder,
    });

    const onNameChange = useDebouncedCallback((e: ChangeEvent<HTMLInputElement>) => {
        const params = new URLSearchParams(searchParams);
        if (e.target.value) {
            params.set('name', e.target.value);
        } else {
            params.delete('name');
        }
        params.set('page', '1');

        router.replace(`${pathName}?${params.toString()}`);
    }, 300);
    const changePage = (page: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', page.toString());
        router.replace(`${pathName}?${params.toString()}`);
    }
    const changeOrder = (column: Column, order: Order) => {
        setOrder({
            column: column,
            order: order,
        });
        const params = new URLSearchParams(searchParams);
        params.set('columnAndOrder', `${column}-${order}`);
        params.set('page', '1');
        router.replace(`${pathName}?${params.toString()}`);
    };

    return (
        <div className="space-y-5">
            <input defaultValue={name}
                    onChange={onNameChange}
                    className="border border-black p-1 rounded"
                    placeholder="Name"/>
            <table className="border-separate border-spacing-2">
                <thead>
                    <tr>
                        <th>
                            <span className="flex gap-3 items-center">
                                <span>Name</span>
                                <OrderButton
                                    order={order.column === "name" ? order.order : "none"}
                                    setOrder={(order) => {
                                        changeOrder("name", order);
                                    }}
                                />
                            </span>
                        </th>
                        <th>
                            <span className="flex gap-2 items-center">
                                <span>Width</span>
                                <OrderButton
                                    order={order.column === "width" ? order.order : "none"}
                                    setOrder={(order) => {
                                        changeOrder("width", order);
                                    }}
                                />
                            </span>
                        </th>
                        <th>
                            <span className="flex gap-2 items-center">
                                <span>Height</span>
                                <OrderButton
                                    order={order.column === "height" ? order.order : "none"}
                                    setOrder={(order) => {
                                        changeOrder("height", order);
                                    }}
                                />
                            </span>
                        </th>
                        <th>
                            <span className="flex gap-2 items-center">
                                <span>Height by width</span>
                                <OrderButton
                                    order={order.column === "heightbywidth" ? order.order : "none"}
                                    setOrder={(order) => {
                                        changeOrder("heightbywidth", order);
                                    }}
                                />
                            </span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i}>
                            <td><Link href={`/map/${row.id}`} className="underline">{row.name}</Link></td>
                            <td className="text-center">{row.width}</td>
                            <td className="text-center">{row.height}</td>
                            <td className="text-center">{Math.round(row.height/row.width * 1000) / 1000}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="flex justify-between">
                <div className="flex gap-2">
                    { page > 1 && (
                        <>
                            <button onClick={() => {
                                changePage(1);
                            }}><FaAngleDoubleLeft className="text-2xl"/></button>
                            <button onClick={() => {
                                changePage(page - 1);
                            }}><FaAngleLeft className="text-2xl"/></button>
                        </>
                    )}
                </div>
                <div className="flex gap-2">
                    { page < numberOfPages && (
                        <>
                            <button onClick={() => {
                                changePage(page + 1);
                            }}><FaAngleRight className="text-2xl"/></button>
                            <button onClick={() => {
                                changePage(numberOfPages);
                            }}><FaAngleDoubleRight className="text-2xl"/></button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}