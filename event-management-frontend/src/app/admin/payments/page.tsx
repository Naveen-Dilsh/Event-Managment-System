"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
    CreditCard, Search, RefreshCw, Loader2, Settings2,
    AlertTriangle, CheckCircle2, Eye, XCircle, Plus,
} from "lucide-react";
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
import { paymentApi, bookingApi } from "@/lib/api";
import { toast } from "sonner";
import type { PaymentResponse } from "@/lib/types";

const statusColors: Record<string, string> = {
    SUCCESS: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    COMPLETED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    PROCESSING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    FAILED: "bg-red-500/10 text-red-400 border-red-500/20",
    REJECTED: "bg-red-500/10 text-red-400 border-red-500/20",
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

export default function PaymentsPage() {
    const [payments, setPayments] = useState<PaymentResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    // Review / Accept dialog
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [reviewingPayment, setReviewingPayment] = useState<PaymentResponse | null>(null);
    const [accepting, setAccepting] = useState(false);

    // Reject dialog
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rejectingPayment, setRejectingPayment] = useState<PaymentResponse | null>(null);
    const [rejecting, setRejecting] = useState(false);

    // Refund dialog
    const [refundDialogOpen, setRefundDialogOpen] = useState(false);
    const [refundingPayment, setRefundingPayment] = useState<PaymentResponse | null>(null);
    const [refundReason, setRefundReason] = useState("");
    const [refundAmount, setRefundAmount] = useState<number>(0);
    const [refunding, setRefunding] = useState(false);

    // Process Payment dialog
    const [processDialogOpen, setProcessDialogOpen] = useState(false);
    const [newPayment, setNewPayment] = useState({
        bookingId: "",
        amount: "",
        paymentMethod: "CREDIT_CARD",
        paymentGateway: "MOCK_GATEWAY"
    });
    const [processing, setProcessing] = useState(false);

    const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
        availableColumns.reduce((acc, col) => ({ ...acc, [col.id]: true }), {})
    );

    const loadPayments = useCallback(async () => {
        setLoading(true);
        try {
            const all = await paymentApi.getAll();
            setPayments(all);
        } catch (err: any) {
            toast.error(err.message || "Failed to load payments");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadPayments(); }, [loadPayments]);

    // ── Accept payment → mark SUCCESS + confirm booking ────────────────────
    const handleAcceptPayment = async () => {
        if (!reviewingPayment) return;
        setAccepting(true);
        try {
            // 1. Mark payment as SUCCESS in payment-service
            await paymentApi.accept(reviewingPayment.id);
            // 2. Confirm the booking in booking-service
            await bookingApi.confirm(reviewingPayment.bookingId);
            toast.success("Payment accepted & booking confirmed ");
            setReviewDialogOpen(false);
            setReviewingPayment(null);
            await loadPayments();
        } catch (err: any) {
            toast.error(err.message || "Failed to accept payment");
        } finally {
            setAccepting(false);
        }
    };

    // ── Reject payment → cancel booking ─────────────────────────────────────
    const handleRejectPayment = async () => {
        if (!rejectingPayment) return;
        setRejecting(true);
        try {
            await paymentApi.reject(rejectingPayment.id);
            await bookingApi.cancel(rejectingPayment.bookingId);
            toast.success("Payment rejected & booking cancelled ");
            setRejectDialogOpen(false);
            setRejectingPayment(null);
            await loadPayments();
        } catch (err: any) {
            toast.error(err.message || "Failed to reject payment");
        } finally {
            setRejecting(false);
        }
    };

    // ── Refund payment → cancel booking ─────────────────────────────────────
    const handleRefund = async () => {
        if (!refundingPayment) return;
        setRefunding(true);
        try {
            const updated = await paymentApi.refund(refundingPayment.id, {
                refundAmount: refundAmount || 0,
            });
            // Cancel the linked booking as well
            try {
                await bookingApi.cancel(refundingPayment.bookingId);
            } catch {
                /* booking may already be cancelled – ignore */
            }
            setPayments((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
            setRefundDialogOpen(false);
            setRefundReason("");
            setRefundAmount(0);
            toast.success("Refund processed & booking cancelled!");
        } catch (err: any) {
            toast.error(err.message || "Failed to process refund");
        } finally {
            setRefunding(false);
        }
    };

    // ── Process new payment manually ────────────────────────────────────────
    const handleProcessPayment = async () => {
        setProcessing(true);
        try {
            await paymentApi.process({
                bookingId: Number(newPayment.bookingId),
                amount: Number(newPayment.amount),
                paymentMethod: newPayment.paymentMethod,
                paymentGateway: newPayment.paymentGateway,
            });
            toast.success("Payment submitted successfully!");
            setProcessDialogOpen(false);
            setNewPayment({ bookingId: "", amount: "", paymentMethod: "CREDIT_CARD", paymentGateway: "MOCK_GATEWAY" });
            await loadPayments();
        } catch (err: any) {
            toast.error(err.message || "Failed to process payment");
        } finally {
            setProcessing(false);
        }
    };

    const filtered = useMemo(() => {
        return payments.filter((p) => {
            const matchesStatus = statusFilter === "ALL" || p.paymentStatus === statusFilter;
            const matchesSearch =
                p.transactionId?.toLowerCase().includes(search.toLowerCase()) ||
                p.paymentMethod?.toLowerCase().includes(search.toLowerCase()) ||
                String(p.bookingId).includes(search);
            return matchesStatus && matchesSearch;
        });
    }, [payments, search, statusFilter]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight gradient-text">Payments</h1>
                    <p className="mt-1 text-muted-foreground">Review, accept, or reject payment transactions</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={loadPayments} variant="outline" className="border-border/50">
                        <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                    </Button>
                    <Button onClick={() => setProcessDialogOpen(true)} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                        <Plus className="mr-2 h-4 w-4" /> Process Payment
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="flex gap-3 w-full sm:max-w-md">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search by transaction, method, booking ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 bg-card/50 border-border/50"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-36 bg-card/50 border-border/50">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Status</SelectItem>
                            <SelectItem value="PROCESSING">Processing</SelectItem>
                            <SelectItem value="SUCCESS">Success</SelectItem>
                            <SelectItem value="FAILED">Failed</SelectItem>
                            <SelectItem value="REFUNDED">Refunded</SelectItem>
                            <SelectItem value="REJECTED">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="bg-card/50 border-border/50 hidden sm:flex">
                            <Settings2 className="mr-2 h-4 w-4" /> Columns
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
                                {loading ? Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i} className="border-border/20">
                                        {visibleColumns.id && <TableCell><Skeleton className="h-4 w-12" /></TableCell>}
                                        {visibleColumns.booking && <TableCell><Skeleton className="h-4 w-12" /></TableCell>}
                                        {visibleColumns.amount && <TableCell><Skeleton className="h-4 w-16" /></TableCell>}
                                        {visibleColumns.method && <TableCell><Skeleton className="h-4 w-20" /></TableCell>}
                                        {visibleColumns.gateway && <TableCell><Skeleton className="h-4 w-20" /></TableCell>}
                                        {visibleColumns.status && <TableCell><Skeleton className="h-5 w-24" /></TableCell>}
                                        {visibleColumns.transaction && <TableCell><Skeleton className="h-4 w-24" /></TableCell>}
                                        {visibleColumns.date && <TableCell><Skeleton className="h-4 w-20" /></TableCell>}
                                        <TableCell><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                                    </TableRow>
                                )) : filtered.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={Object.values(visibleColumns).filter(Boolean).length + 1} className="h-32 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <AlertTriangle className="h-6 w-6 text-muted-foreground/50" />
                                                <p>No payments found.</p>
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
                                            <div className="flex items-center justify-end gap-1">
                                                {/* PROCESSING: Review (Accept) + Reject */}
                                                {p.paymentStatus === "PROCESSING" && (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 text-muted-foreground hover:text-emerald-400"
                                                            onClick={() => { setReviewingPayment(p); setReviewDialogOpen(true); }}
                                                        >
                                                            <Eye className="mr-1.5 h-3.5 w-3.5" /> Review
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 text-muted-foreground hover:text-red-400"
                                                            onClick={() => { setRejectingPayment(p); setRejectDialogOpen(true); }}
                                                        >
                                                            <XCircle className="mr-1.5 h-3.5 w-3.5" /> Reject
                                                        </Button>
                                                    </>
                                                )}
                                                {/* SUCCESS: show Accepted label + Refund button */}
                                                {p.paymentStatus === "SUCCESS" && (
                                                    <>
                                                        <span className="text-xs text-emerald-400 flex items-center gap-1 mr-1">
                                                            <CheckCircle2 className="h-3.5 w-3.5" /> Accepted
                                                        </span>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 text-muted-foreground hover:text-amber-400"
                                                            onClick={() => { setRefundingPayment(p); setRefundAmount(p.amount ?? 0); setRefundDialogOpen(true); }}
                                                        >
                                                            <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refund
                                                        </Button>
                                                    </>
                                                )}
                                                {/* REJECTED: show label */}
                                                {p.paymentStatus === "REJECTED" && (
                                                    <span className="text-xs text-red-400 flex items-center gap-1 mr-1">
                                                        <XCircle className="h-3.5 w-3.5" /> Rejected
                                                    </span>
                                                )}
                                                {/* REFUNDED: show label */}
                                                {p.paymentStatus === "REFUNDED" && (
                                                    <span className="text-xs text-blue-400 flex items-center gap-1 mr-1">
                                                        <RefreshCw className="h-3.5 w-3.5" /> Refunded
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* ── Review / Accept Payment Dialog ── */}
            <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                <DialogContent className="max-w-md bg-card border-border/50">
                    <DialogHeader>
                        <DialogTitle className="gradient-text">Review Payment</DialogTitle>
                        <DialogDescription>Accept this payment to confirm the booking.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="rounded-lg border border-border/50 bg-background/50 p-4 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Payment ID</span>
                                <span className="font-medium">#{reviewingPayment?.id}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Booking ID</span>
                                <span className="font-medium">#{reviewingPayment?.bookingId}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Method</span>
                                <span className="font-medium">{reviewingPayment?.paymentMethod}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Transaction</span>
                                <span className="font-mono text-xs text-violet-400">{reviewingPayment?.transactionId || "—"}</span>
                            </div>
                            <div className="h-px bg-border/40" />
                            <div className="flex justify-between font-semibold">
                                <span>Amount</span>
                                <span className="text-emerald-400 text-lg">${reviewingPayment?.amount?.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-sm text-amber-400">
                            ⚠️ Accepting this payment will confirm the associated booking.
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setReviewDialogOpen(false)} disabled={accepting}>Dismiss</Button>
                        <Button
                            onClick={handleAcceptPayment}
                            disabled={accepting}
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                        >
                            {accepting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                            Accept Payment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Reject Payment Dialog ── */}
            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent className="max-w-md bg-card border-border/50">
                    <DialogHeader>
                        <DialogTitle className="gradient-text">Reject Payment</DialogTitle>
                        <DialogDescription>
                            This will mark the payment as rejected and cancel the associated booking.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="rounded-lg border border-border/50 bg-background/50 p-4 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Payment ID</span>
                                <span className="font-medium">#{rejectingPayment?.id}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Booking ID</span>
                                <span className="font-medium">#{rejectingPayment?.bookingId}</span>
                            </div>
                            <div className="h-px bg-border/40" />
                            <div className="flex justify-between font-semibold">
                                <span>Amount</span>
                                <span className="text-red-400 text-lg">${rejectingPayment?.amount?.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400">
                            ❌ Rejecting this payment will cancel the booking. This action cannot be undone.
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectDialogOpen(false)} disabled={rejecting}>Cancel</Button>
                        <Button
                            onClick={handleRejectPayment}
                            disabled={rejecting}
                            className="bg-gradient-to-r from-red-600 to-rose-600 text-white"
                        >
                            {rejecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                            Reject Payment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Refund Dialog ── */}
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
                        <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 text-sm text-blue-400">
                            ℹ️ Processing this refund will also cancel the associated booking.
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRefundDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleRefund} disabled={refunding || !refundReason || refundAmount <= 0} className="bg-gradient-to-r from-amber-600 to-orange-600 text-white">
                            {refunding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                            Execute Refund
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Process Payment Dialog ── */}
            <Dialog open={processDialogOpen} onOpenChange={setProcessDialogOpen}>
                <DialogContent className="max-w-md bg-card border-border/50">
                    <DialogHeader>
                        <DialogTitle className="gradient-text">Process New Payment</DialogTitle>
                        <DialogDescription>Manually process a payment for a booking.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Booking ID *</Label>
                            <Input
                                type="number"
                                value={newPayment.bookingId}
                                onChange={(e) => setNewPayment(prev => ({ ...prev, bookingId: e.target.value }))}
                                placeholder="e.g. 101"
                                className="bg-background/50 focus-visible:ring-violet-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Amount *</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={newPayment.amount}
                                onChange={(e) => setNewPayment(prev => ({ ...prev, amount: e.target.value }))}
                                placeholder="0.00"
                                className="bg-background/50 focus-visible:ring-violet-500"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Method</Label>
                                <Select value={newPayment.paymentMethod} onValueChange={(val) => setNewPayment(prev => ({ ...prev, paymentMethod: val }))}>
                                    <SelectTrigger className="bg-background/50 focus-visible:ring-violet-500">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                                        <SelectItem value="DEBIT_CARD">Debit Card</SelectItem>
                                        <SelectItem value="PAYPAL">PayPal</SelectItem>
                                        <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Gateway</Label>
                                <Select value={newPayment.paymentGateway} onValueChange={(val) => setNewPayment(prev => ({ ...prev, paymentGateway: val }))}>
                                    <SelectTrigger className="bg-background/50 focus-visible:ring-violet-500">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MOCK_GATEWAY">Mock Gateway</SelectItem>
                                        <SelectItem value="STRIPE">Stripe</SelectItem>
                                        <SelectItem value="PAYPAL">PayPal</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setProcessDialogOpen(false)} disabled={processing}>Cancel</Button>
                        <Button
                            onClick={handleProcessPayment}
                            disabled={processing || !newPayment.bookingId || !newPayment.amount}
                            className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
                        >
                            {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                            Process Payment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
