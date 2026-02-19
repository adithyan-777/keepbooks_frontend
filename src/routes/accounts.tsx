import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  createColumnHelper,
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
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export const Route = createFileRoute('/accounts')({
  component: AccountPage,
})

type Account = {
  id: string
  name: string
  account_type: string
  allow_negative_balance: boolean
  allow_positive_balance: boolean
  balance: string
  currency: string
  metadata?: {
    note: string
    category: string
  }
  created_at: string
  updated_at: string
  version: string
}

function useAccounts() {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: async (): Promise<Array<Account>> => {
      const response = await fetch('http://localhost:5000/accounts')
      return await response.json()
    },
  })
}

const columnHelper = createColumnHelper<Account>()

const columns = [
  columnHelper.accessor('name', {
    header: 'Name',
    cell: (info) => (
      <span className="font-medium">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor('account_type', {
    header: 'Type',
    cell: (info) => (
      <Badge variant="outline" className="capitalize">
        {info.getValue()}
      </Badge>
    ),
  }),
  columnHelper.accessor('balance', {
    header: 'Balance',
    cell: (info) => {
      const balance = parseFloat(info.getValue())
      const isNegative = balance < 0
      return (
        <span className={isNegative ? 'text-red-500 font-semibold' : 'text-green-600 font-semibold'}>
          {isNegative ? '-' : '+'}{Math.abs(balance).toFixed(2)}
        </span>
      )
    },
  }),
  columnHelper.accessor('currency', {
    header: 'Currency',
    cell: (info) => (
      <Badge variant="secondary">{info.getValue()}</Badge>
    ),
  }),
  columnHelper.accessor('metadata', {
    header: 'Category',
    cell: (info) => {
      const val = info.getValue()
      return val?.category ? (
        <Badge>{val.category}</Badge>
      ) : (
        <span className="text-muted-foreground text-sm">—</span>
      )
    },
  }),
  columnHelper.accessor('metadata', {
    id: 'note',
    header: 'Note',
    cell: (info) => {
      const val = info.getValue()
      return val?.note ? (
        <span className="text-sm text-muted-foreground">{val.note}</span>
      ) : (
        <span className="text-muted-foreground text-sm">—</span>
      )
    },
  }),
]

function LoadingSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}

function AccountPage() {
  const { isLoading, error, data } = useAccounts()

  const table = useReactTable({
    data: data ?? [],
    filterFns: {} as any,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Accounts</CardTitle>
          <CardDescription>
            Manage and view all your financial accounts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="text-center text-muted-foreground py-10"
                    >
                      No accounts found.
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} className="hover:bg-muted/50">
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}