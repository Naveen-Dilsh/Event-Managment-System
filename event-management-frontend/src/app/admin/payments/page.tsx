"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { CreditCard, Search, RefreshCw, Loader2, Settings2, Plus, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
    DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { paymentApi } from "@/lib/api";
import { toast } from "sonner";
import type { PaymentRequest, PaymentResponse } from "@/lib/types";

const statusColors: Record<string, string> = {
    SUCCESS: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    COMPLETED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    FAILED: "bg-red-500/10 text-red-400 border-red-500/20",
    REFUNDED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    PARTIALLY_REFUNDED: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
};

const availableColumns = [
    { id: "id", label: "ID" },
    { id: "booking", label: "Booking" },
    { id: "amount", label: "Amount" },
    { id: "method", label: "Method" },
    { id: "gateway", label: "Gateway" },
    { id: "status", label: "Status" },
    { id: "transaction", label: "Transaction" },
    { id: "date", label: "Date" },
];

const emptyForm: PaymentRequest = {
    bookingId: 0,
    amount: 0,
    paymentMethod: "CREDIT_CARD",
    paymentGateway: "MockGateway",
};

export default function PaymentsPage() {
    const [payments, setPayments] = useState<PaymentResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [refundDialogOpen, setRefundDialogOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [refundingPayment, setRefundingPayment] = useState<PaymentResponse | null>(null);
    const [refundReason, setRefundReason] = useState("");
    const [refundAmount, setRefundAmount] = useState<number>(0);
    const [refunding, setRefunding] = useState(false);
    const [saving, setSaving] = useState(false);
    const [searchById, setSearchById] = useState("");
    const [form, setForm] = useState<PaymentRequest>(emptyForm);
    const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
        availableColumns.reduce((acc, col) => ({ ...acc, [col.id]: true }), {})
    );

    const searchPayment = async () => {
        if (!searchById.trim()) return;
        setLoading(true);
        try {
            const payment = await paymentApi.getById(Number(searchById));
            setPayments((prev) => {
                const exists = prev.find((p) => p.id === payment.id);
                if (exists) return prev;
                return [payment, ...prev];
            });
            toast.success("Payment retrieved!");
        } catch (err: any) {
            console.error("Payment not found by ID. Trying Booking ID:", err);
            // Try as booking ID
            try {
                const payment = await paymentApi.getByBooking(Number(searchById));
                setPayments((prev) => {
                    const exists = prev.find((p) => p.id === payment.id);
                    if (exists) return prev;
                    return [payment, ...prev];
                });
                toast.success("Payment retrieved via Booking ID!");
            } catch (err2: any) {
                console.error("No payment found:", err2);
                toast.error(err2.message || "No relevant payment found from search query");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setForm(emptyForm);
        setCreateDialogOpen(true);
    };

    const handleSave = async () => {
        if (!form.bookingId || form.amount <= 0) {
            toast.error("Valid Booking ID and non-zero Amount are required");
            return;
        }
        setSaving(true);
        try {
            const newPayment = await paymentApi.process(form);
            toast.success("Payment processed successfully");
            setPayments((prev) => {
                const filtered = prev.filter(p => p.id !== newPayment.id);
                return [newPayment, ...filtered];
            });
            setCreateDialogOpen(false);
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Failed to process payment");
        } finally {
            setSaving(false);
        }
    };

    const handleRefund = async () => {
        if (!refundingPayment) return;
        setRefunding(true);
        try {
            // Note: backend expects amount/reason but might just execute full status transitions.
            const updated = await paymentApi.refund(refundingPayment.id, {
                refundAmount: refundAmount || 0,
            });
            setPayments((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
            setRefundDialogOpen(false);
            setRefundReason("");
            setRefundAmount(0);
            toast.success("Refund processed successfully!");
        } catch (err: any) {
            console.error("Refund failed:", err);
            toast.error(err.message || "Failed to process refund");
        } finally {
            setRefunding(false);
        }
    };

    const filtered = useMemo(() => {
        return payments.filter(
            (p) =>
                p.transactionId?.toLowerCase().includes(search.toLowerCase()) ||
                p.paymentMethod?.toLowerCase().includes(search.toLowerCase()) ||
                String(p.bookingId).includes(search)
        );
    }, [payments, search]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight gradient-text">Payments</h1>
                    <p className="mt-1 text-muted-foreground">Process transactions securely and trigger refunds</p>
                </div>
                <Button onClick={handleCreate} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/20 hover:shadow-violet-600/30 transition-all">
                    <Plus className="mr-2 h-4 w-4" /> Process Payment
                </Button>
            </div>

            {/* Top Toolbar Actions */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="flex gap-3 w-full sm:max-w-md">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Fetch by Payment or Booking ID..."
                            value={searchById}
                            onChange={(e) => setSearchById(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && searchPayment()}
                            className="pl-9 bg-card/50 border-border/50"
                        />
                    </div>
                    <Button onClick={searchPayment} variant="secondary">
                        Fetch
                    </Button>
                </div>

                {payments.length > 0 && (
                    <div className="flex flex-1 w-full justify-end items-center gap-4">
                        <div className="relative w-full sm:max-w-xs flex-1 sm:flex-none">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input placeholder="Filter list..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-card/50 border-border/50" />
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="bg-card/50 border-border/50 hidden sm:flex">
                                    <Settings2 className="mr-2 h-4 w-4" />
                                    Columns
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[150px]">
                                {availableColumns.map((col) => (
                                    <DropdownMenuCheckboxItem
                                        key={col.id}
                                        className="capitalize"
                                        checked={visibleColumns[col.id]}
                                        onCheckedChange={(value) =>
                                            setVisibleColumns((prev) => ({ ...prev, [col.id]: !!value }))
                                        }
                                    >
                                        {col.label}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </div>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-violet-400" /> Payment Records ({filtered.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border/30 hover:bg-transparent">
                                    {visibleColumns.id && <TableHead className="text-muted-foreground">ID</TableHead>}
                                    {visibleColumns.booking && <TableHead className="text-muted-foreground">Booking</TableHead>}
                                    {visibleColumns.amount && <TableHead className="text-muted-foreground">Amount</TableHead>}
                                    {visibleColumns.method && <TableHead className="text-muted-foreground">Method</TableHead>}
                                    {visibleColumns.gateway && <TableHead className="text-muted-foreground">Gateway</TableHead>}
                                    {visibleColumns.status && <TableHead className="text-muted-foreground">Status</TableHead>}
                                    {visibleColumns.transaction && <TableHead className="text-muted-foreground">Transaction</TableHead>}
                                    {visibleColumns.date && <TableHead className="text-muted-foreground">Date</TableHead>}
                                    <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? Array.from({ length: 3 }).map((_, i) => (
                                    <TableRow key={i} className="border-border/20">
                                        {visibleColumns.id && <TableCell><Skeleton className="h-4 w-12" /></TableCell>}
                                        {visibleColumns.booking && <TableCell><Skeleton className="h-4 w-12" /></TableCell>}
                                        {visibleColumns.amount && <TableCell><Skeleton className="h-4 w-16" /></TableCell>}
                                        {visibleColumns.method && <TableCell><Skeleton className="h-4 w-20" /></TableCell>}
                                        {visibleColumns.gateway && <TableCell><Skeleton className="h-4 w-20" /></TableCell>}
                                        {visibleColumns.status && <TableCell><Skeleton className="h-5 w-24" /></TableCell>}
                                        {visibleColumns.transaction && <TableCell><Skeleton className="h-4 w-24" /></TableCell>}
                                        {visibleColumns.date && <TableCell><Skeleton className="h-4 w-20" /></TableCell>}
                                        <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                                    </TableRow>
                                )) : filtered.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={Object.values(visibleColumns).filter(Boolean).length + 1} className="h-32 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <AlertTriangle className="h-6 w-6 text-muted-foreground/50" />
                                                <p>{payments.length === 0 ? "No active session payments. Fetch one by ID or Process a new payment." : "No matching payments based on filter."}</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filtered.map((p) => (
                                    <TableRow key={p.id} className="border-border/20 transition-colors hover:bg-accent/30">
                                        {visibleColumns.id && <TableCell className="font-medium text-violet-400">#{p.id}</TableCell>}
                                        {visibleColumns.booking && <TableCell className="text-muted-foreground">#{p.bookingId}</TableCell>}
                                        {visibleColumns.amount && <TableCell className="font-medium">${p.amount?.toFixed(2)}</TableCell>}
                                        {visibleColumns.method && <TableCell className="text-muted-foreground">{p.paymentMethod}</TableCell>}
                                        {visibleColumns.gateway && <TableCell className="text-muted-foreground">{p.paymentGateway}</TableCell>}
                                        {visibleColumns.status && (
                                            <TableCell>
                                                <Badge variant="outline" className={statusColors[p.paymentStatus] || statusColors.PENDING}>
                                                    {p.paymentStatus}
                                                </Badge>
                                            </TableCell>
                                        )}
                                        {visibleColumns.transaction && <TableCell className="text-xs text-muted-foreground font-mono">{p.transactionId || "—"}</TableCell>}
                                        {visibleColumns.date && <TableCell className="text-muted-foreground">{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : "—"}</TableCell>}
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 text-muted-foreground hover:text-amber-400"
                                                onClick={() => { setRefundingPayment(p); setRefundAmount(p.amount); setRefundDialogOpen(true); }}
                                                disabled={p.paymentStatus === "REFUNDED" || p.paymentStatus === "FAILED" || p.paymentStatus === "PARTIALLY_REFUNDED"}
                                            >
                                                <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refund
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Create Payment Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="max-w-xl bg-card border-border/50">
                    <DialogHeader>
                        <DialogTitle className="gradient-text text-xl">Process Manual Payment</DialogTitle>
                        <DialogDescription>
                            Initiate a payment collection directly mapped to an existing Booking ID.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Booking ID *</Label>
                                <Input type="number" value={form.bookingId || ""} onChange={(e) => setForm({ ...form, bookingId: Number(e.target.value) || 0 })} placeholder="e.g. 101" className="bg-background/50 focus-visible:ring-violet-500" />
                            </div>
                            <div className="space-y-2">
                                <Label>Amount (USD) *</Label>
                                <Input type="number" step="0.01" value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) || 0 })} placeholder="0.00" className="bg-background/50 focus-visible:ring-violet-500" />
                            </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Payment Method</Label>
                                <Select value={form.paymentMethod} onValueChange={(v) => setForm({ ...form, paymentMethod: v })}>
                                    <SelectTrigger className="bg-background/50 focus:ring-violet-500"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                                        <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                                        <SelectItem value="PAYPAL">PayPal</SelectItem>
                                        <SelectItem value="CASH">Cash</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Payment Gateway</Label>
                                <Select value={form.paymentGateway} onValueChange={(v) => setForm({ ...form, paymentGateway: v })}>
                                    <SelectTrigger className="bg-background/50 focus:ring-violet-500"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MockGateway">Mock Gateway</SelectItem>
                                        <SelectItem value="Stripe">Stripe</SelectItem>
                                        <SelectItem value="PayPal">PayPal API</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-violet-600/30 transition-all">
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
                            Submit Transaction
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Refund Dialog */}
            <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
                <DialogContent className="max-w-md bg-card border-border/50">
                    <DialogHeader><DialogTitle className="gradient-text">Process Refund</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 flex justify-between items-center">
                            <div>
                                <p className="text-xs text-muted-foreground">Original Transaction</p>
                                <p className="text-sm font-medium">#{refundingPayment?.transactionId || refundingPayment?.id}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground">Max Refundable</p>
                                <p className="text-2xl font-bold text-amber-500">${refundingPayment?.amount?.toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Refund Amount</Label>
                            <Input type="number" step="0.01" max={refundingPayment?.amount} value={refundAmount || ""} onChange={(e) => setRefundAmount(Number(e.target.value))} className="bg-background/50 focus-visible:ring-amber-500" />
                        </div>
                        <div className="space-y-2">
                            <Label>Reason *</Label>
                            <Textarea value={refundReason} onChange={(e) => setRefundReason(e.target.value)} placeholder="State the reason for refund..." rows={3} className="bg-background/50 focus-visible:ring-amber-500" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRefundDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleRefund} disabled={refunding || !refundReason || refundAmount <= 0} className="bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:shadow-lg hover:shadow-amber-600/30 transition-all">
                            {refunding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                            Execute Refund
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

