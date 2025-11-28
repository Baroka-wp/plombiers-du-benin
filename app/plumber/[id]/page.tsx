"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Star,
  MapPin,
  Phone,
  Shield,
  CheckCircle,
  Clock,
  MessageSquare,
  Send,
  X,
  Award,
  TrendingUp,
} from "lucide-react";

interface Plumber {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  departement: string;
  ville: string;
  quartier: string;
  photoUrl: string | null;
  isVerified: boolean;
  hasPaid: boolean;
  membershipId: string | null;
  diplomeAnnee: number;
  averageRating: number;
  reviewCount: number;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  clientPhone: string | null;
  createdAt: string;
}

export default function PlumberProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [plumber, setPlumber] = useState<Plumber | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchPlumber();
    fetchReviews();
  }, [id]);

  const fetchPlumber = async () => {
    try {
      const response = await fetch(`/api/plumbers/${id}`);
      if (response.ok) {
        const data = await response.json();
        setPlumber(data);
      }
    } catch (error) {
      console.error("Error fetching plumber:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?plumberId=${id}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      return;
    }

    setSubmittingReview(true);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plumberId: id,
          rating,
          comment: comment.trim() || null,
        }),
      });

      if (response.ok) {
        setSuccessMessage("Merci pour votre avis !");
        setRating(0);
        setComment("");
        setShowReviewForm(false);
        
        // Rafraîchir les données
        fetchPlumber();
        fetchReviews();
        
        // Masquer le message après 3 secondes
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        const data = await response.json();
        alert(data.error || "Erreur lors de l'envoi de l'avis");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Erreur lors de l'envoi de l'avis");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!plumber) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Plombier non trouvé
          </h1>
          <p className="text-slate-600 mb-4">
            L'identifiant fourni ne correspond à aucun plombier.
          </p>
          <button
            onClick={() => router.push("/annuaire")}
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Retour à l'annuaire
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-slide-in">
          <CheckCircle className="w-5 h-5" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Photo */}
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg flex-shrink-0">
                {plumber.photoUrl ? (
                  <Image
                    src={plumber.photoUrl}
                    alt={`${plumber.prenom} ${plumber.nom}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                    <Shield className="w-16 h-16 text-slate-400" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-white">
                    {plumber.prenom} {plumber.nom}
                  </h1>
                  {plumber.isVerified && (
                    <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-white" />
                      <span className="text-xs font-bold text-white">VÉRIFIÉ</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-white/90 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span>
                      {plumber.ville}, {plumber.departement}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    <a
                      href={`tel:${plumber.telephone}`}
                      className="hover:text-white font-semibold"
                    >
                      {plumber.telephone}
                    </a>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-6 h-6 ${
                          star <= Math.round(plumber.averageRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-white/30"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-white font-bold text-xl">
                    {plumber.averageRating > 0
                      ? plumber.averageRating.toFixed(1)
                      : "Nouveau"}
                  </span>
                  {plumber.reviewCount > 0 && (
                    <span className="text-white/80">
                      ({plumber.reviewCount} avis)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Info */}
          <div className="p-6 bg-white">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  {plumber.diplomeAnnee}
                </div>
                <div className="text-sm text-slate-600">Année diplôme</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  {plumber.reviewCount}
                </div>
                <div className="text-sm text-slate-600">Avis clients</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  {plumber.averageRating > 0
                    ? `${(plumber.averageRating / 5) * 100}%`
                    : "—"}
                </div>
                <div className="text-sm text-slate-600">Satisfaction</div>
              </div>
            </div>
            
            {/* Adresse complète */}
            <div className="border-t border-slate-200 pt-4 mt-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-slate-600 mb-1">Adresse complète</div>
                  <div className="text-base text-slate-900 font-medium">
                    {plumber.quartier}
                  </div>
                  <div className="text-sm text-slate-600 mt-1">
                    {plumber.ville}, {plumber.departement}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action - Review */}
        {!showReviewForm && (
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl shadow-lg p-6 mb-6 text-center">
            <Award className="w-12 h-12 text-slate-900 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Avez-vous travaillé avec {plumber.prenom} ?
            </h2>
            <p className="text-slate-800 mb-4">
              Partagez votre expérience et aidez d'autres clients à faire le bon choix
            </p>
            <button
              onClick={() => setShowReviewForm(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Noter ce plombier
            </button>
          </div>
        )}

        {/* Review Form */}
        {showReviewForm && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                Votre avis sur {plumber.prenom} {plumber.nom}
              </h2>
              <button
                onClick={() => {
                  setShowReviewForm(false);
                  setRating(0);
                  setComment("");
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-6">
              {/* Rating Stars */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Note (obligatoire)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-10 h-10 ${
                          star <= (hoverRating || rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="ml-3 text-lg font-semibold text-slate-700">
                      {rating === 5
                        ? "Excellent"
                        : rating === 4
                        ? "Très bien"
                        : rating === 3
                        ? "Bien"
                        : rating === 2
                        ? "Moyen"
                        : "Médiocre"}
                    </span>
                  )}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Commentaire (optionnel)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Décrivez votre expérience avec ce plombier..."
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none text-slate-900 placeholder:text-slate-400"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={rating === 0 || submittingReview}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                {submittingReview ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Publier mon avis
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Reviews List */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-emerald-600" />
              Avis clients ({reviews.length})
            </h2>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p className="text-lg font-medium mb-2">Aucun avis pour le moment</p>
              <p className="text-sm">
                Soyez le premier à partager votre expérience avec ce plombier
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-slate-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-slate-700">
                        {review.rating}/5
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {new Date(review.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-slate-700 mb-2">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

