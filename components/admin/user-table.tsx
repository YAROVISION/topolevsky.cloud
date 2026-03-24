'use client'

import * as React from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { updateUserTier } from '@/app/admin/actions'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Shield, User, Star } from 'lucide-react'

interface UserData {
  id: string
  email: string
  name: string | null
  role: string
  subscriptionTier: string
  createdAt: Date
}

export function UserTable({ data }: { data: UserData[] }) {
  const columns: ColumnDef<UserData>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('name') || 'No name'}</div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => {
        const role = row.getValue('role') as string
        return (
          <Badge variant={role === 'ADMIN' ? 'destructive' : 'secondary'} className="flex items-center gap-1 w-fit">
            {role === 'ADMIN' ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
            {role}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'subscriptionTier',
      header: 'Tier',
      cell: ({ row }) => {
        const tier = row.getValue('subscriptionTier') as string
        const variants: Record<string, string> = {
          FREE: 'secondary',
          PRO: 'default',
          SPECIAL: 'outline',
        }
        return (
          <Badge 
            variant={variants[tier] as any || 'secondary'} 
            className={`flex items-center gap-1 w-fit ${tier === 'SPECIAL' ? 'border-amber-500 text-amber-500 bg-amber-50/50' : ''}`}
          >
            {tier === 'PRO' && <Star className="h-3 w-3 fill-current" />}
            {tier}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Registered',
      cell: ({ row }) => {
        const date = new Date(row.getValue('createdAt'))
        return <div suppressHydrationWarning>{date.toLocaleDateString('uk-UA')}</div>
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const user = row.original

        const handleSetTier = async (tier: string) => {
          try {
            const res = await updateUserTier(user.id, tier)
            if (res.success) {
              toast.success(`User set to ${tier}`)
            } else {
              toast.error(res.error || 'Something went wrong')
            }
          } catch (err) {
            toast.error('Failed to update user')
          }
        }

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>
                Copy User ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Change Tier</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleSetTier('FREE')}>Set to FREE</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSetTier('PRO')}>Set to PRO</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSetTier('SPECIAL')} className="text-amber-500 font-bold">
                Set to SPECIAL
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No users found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
