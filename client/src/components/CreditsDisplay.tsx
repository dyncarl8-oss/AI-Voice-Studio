import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { voiceApi } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Coins, Plus } from "lucide-react";
import { whopSdk } from "@/lib/whop-sdk";

interface CreditPackage {
  id: string;
  credits: number;
  amount: number;
}

export default function CreditsDisplay() {
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: creditsData, isLoading } = useQuery({
    queryKey: ['/api/credits'],
    queryFn: () => voiceApi.getCredits(),
    refetchInterval: 5000,
  });

  const { data: packages = [] } = useQuery({
    queryKey: ['/api/credit-packages'],
    queryFn: () => voiceApi.getCreditPackages(),
  });

  const purchaseMutation = useMutation({
    mutationFn: async (pkg: CreditPackage) => {
      console.log('=== STARTING PURCHASE FLOW ===');
      console.log('SDK available:', !!whopSdk);
      console.log('SDK inAppPurchase method:', typeof whopSdk?.inAppPurchase);

      // Create charge on server and get inAppPurchase object
      console.log('Creating charge for package:', pkg.id);
      const inAppPurchaseData = await voiceApi.createCharge(pkg.id);
      console.log('Received inAppPurchase object:', inAppPurchaseData);
      
      // Extract only the required fields for the SDK (id and planId)
      // The SDK expects { id?: string, planId: string }
      const purchaseParams = {
        id: inAppPurchaseData.id,
        planId: inAppPurchaseData.planId,
      };
      
      console.log('Calling whopSdk.inAppPurchase with:', purchaseParams);
      
      // Open payment modal using SDK
      const result = await whopSdk.inAppPurchase(purchaseParams);
      console.log('SDK inAppPurchase result:', result);
      
      if (result.status === "error") {
        throw new Error(result.error || "Purchase failed");
      }

      // If payment succeeded, process it on the backend to add credits
      if (result.status === "ok" && result.data?.receiptId) {
        console.log('Payment succeeded, processing on backend...');
        const processResult = await voiceApi.processPayment(
          inAppPurchaseData.packageId,
          result.data.receiptId
        );
        console.log('Backend processing complete:', processResult);
        return { ...result, processResult };
      }
      
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['/api/credits'] });
      
      if (result?.status === "ok") {
        toast({
          title: "Purchase successful",
          description: "Credits have been added to your account.",
        });
      }
      
      setPurchaseDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Purchase failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const credits = creditsData?.credits ?? 0;

  return (
    <>
      <div className="flex items-center gap-3" data-testid="card-credits">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-card">
          <Coins className="w-4 h-4 text-primary" data-testid="icon-coins" />
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground leading-none">Credits</span>
            {isLoading ? (
              <span className="text-lg font-bold leading-none mt-1">...</span>
            ) : (
              <span className="text-lg font-bold leading-none mt-1" data-testid="text-credits-count">{credits}</span>
            )}
          </div>
        </div>
        <Button 
          size="sm" 
          onClick={() => setPurchaseDialogOpen(true)}
          data-testid="button-buy-credits"
        >
          <Plus className="w-3 h-3 mr-1" />
          Buy
        </Button>
      </div>

      <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Buy Credits</DialogTitle>
            <DialogDescription>
              Select a credit package to continue generating speech
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-3 py-4">
            {packages.map((pkg, index) => (
              <Button
                key={pkg.id}
                variant="outline"
                className="h-auto py-4 flex items-center justify-between relative"
                onClick={() => purchaseMutation.mutate(pkg)}
                disabled={purchaseMutation.isPending}
                data-testid={`button-package-${pkg.id}`}
              >
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4" />
                  <span className="font-semibold">{pkg.credits} Credits</span>
                  {index === 1 && (
                    <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-md font-medium">
                      Popular
                    </span>
                  )}
                </div>
                <span className="text-sm">${(pkg.amount / 100).toFixed(2)}</span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
