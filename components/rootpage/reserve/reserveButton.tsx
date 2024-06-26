"use client";
import { Button } from "@/components/ui/button";
import {
    DialogTrigger,
    Dialog,
    DialogContent,
    DialogClose,
} from "@/components/ui/dialog";
import { useStepper } from "@/components/ui/stepper";
import ReservationSuccess from "@/components/rootpage/reserve/reservationSuccess";
import { useState } from "react";
import ReserveStepper from "./reserveStepper";
import { createReservation } from "@/lib/actions/reservation.actions";
import { sendConfirmation } from "@/lib/actions/resend.actions";
import { format, isSunday } from "date-fns";

function ReserveButton({ user }: any) {
    const [date, setDate] = useState<Date | null>(!isSunday(new Date()) ? new Date() : null);
    const [period, setPeriod] = useState<string>("1");
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button
                    type="submit"
                    className="mr-3 px-3 py-2 bg-amber-500 text-white hover:bg-amber-600 rounded-sm"
                >
                    Réservez maintenant
                </button>
            </DialogTrigger>
            <DialogContent className="px-6 flex items-start justify-center max-w-96 rounded-md flex-col gap-6">
                <div className="flex w-full flex-col gap-4">
                    {user && user.teamId ? (
                        <ReserveStepper
                            date={date}
                            setDate={setDate}
                            selectedPeriod={period}
                            setSelectedPeriod={setPeriod}
                            Footer={
                                <Footer
                                    date={date}
                                    period={period}
                                    user={user}
                                />
                            }
                        />
                    ) : (
                        <div className="w-full p-4 bg-white">
                            <p className="font-semibold text-red-500">Erreur de Réservation</p>
                            <p>Vous devez être chef d'équipe pour réserver.
                                Si vous pensez que c'est une erreur, contactez:
                            </p>
                            <a
                                href="mailto:fablab@e-polytechnique.ma"
                                className="font-bold"
                            >
                                fablab@e-polytechnique.ma
                            </a>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

const Footer = ({ date, period, user }: any) => {
    const [loading, setLoading] = useState(false);
    const {
        nextStep,
        prevStep,
        resetSteps,
        currentStep,
        hasCompletedAllSteps,
        isLastStep,
        isOptionalStep,
        isDisabledStep,
    } = useStepper();

    const [error, setError] = useState("");

    const nextPage = async () => {
        const { label } = currentStep;
        setError("");
        if (label == "Date") {
            if (!date) {
                setError("Vous devez choisir une date.");
                return;
            }
            nextStep();
        } else if (!period || !["1", "2", "3", "4"].includes(period)) {
            setError("Vous devez choisir une période correcte.");
        } else {
            try {
                setLoading(true);
                const reservation = {
                    teamId: user?.teamId,
                    date,
                    period: parseInt(period),
                };
                const resResult = await createReservation(reservation);
                if (resResult.error) {
                    setError(resResult.error);
                } else {
                    try {
                        await sendConfirmation({
                            email: user.email,
                            date: format(date, "PPP"),
                            period,
                        });
                    } catch (error) {}
                    setLoading(false);
                    nextStep();
                }
            } catch (error) {
                setError(
                    "Une erreur inattendue est survenue. Veuillez réessayer."
                );
            }
        }
    };

    return (
        <>
            {error && <div className="text-red-500">{error}</div>}
            {hasCompletedAllSteps && <ReservationSuccess />}
            <div className="w-full flex justify-end gap-2">
                {hasCompletedAllSteps ? (
                    <DialogClose onClick={resetSteps} className="w-full">
                        <Button
                            size="sm"
                            className="w-full text-center hover:bg-primary"
                        >
                            Fermer
                        </Button>
                    </DialogClose>
                ) : (
                    <>
                        <Button
                            disabled={isDisabledStep}
                            onClick={prevStep}
                            size="sm"
                            variant="secondary"
                            className="hover:bg-secondary"
                        >
                            Précédent
                        </Button>
                        <Button
                            size="sm"
                            onClick={nextPage}
                            disabled={loading}
                            className="hover:bg-primary"
                        >
                            {isLastStep
                                ? loading ? "Reserving..." : "Confirmer"
                                : isOptionalStep
                                ? "Passer"
                                : "Suivant"}
                        </Button>
                    </>
                )}
            </div>
        </>
    );
};

export default ReserveButton;
