from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.db.models import Q
from establishments.models import Establishment
from inspections.models import Inspection
from establishments.serializers import EstablishmentSerializer
from inspections.serializers import InspectionSerializer
from users.serializers import UserSerializer

User = get_user_model()

class GlobalSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        q = request.query_params.get("q", "").strip()
        
        # If no search query, return empty results
        if not q:
            return Response({
                "establishments": [],
                "users": [],
                "inspections": [],
                "suggestions": []
            })

        # Establishments query
        est_qs = Establishment.objects.all()
        if q:
            est_qs = est_qs.filter(
                Q(name__icontains=q)
                | Q(nature_of_business__icontains=q)
                | Q(province__icontains=q)
                | Q(city__icontains=q)
                | Q(barangay__icontains=q)
            )

        establishments = EstablishmentSerializer(est_qs[:10], many=True).data

        # Users query
        user_qs = User.objects.all()
        if q:
            user_qs = user_qs.filter(
                Q(first_name__icontains=q)
                | Q(last_name__icontains=q)
                | Q(email__icontains=q)
                | Q(userlevel__icontains=q)
            )
        users = UserSerializer(user_qs[:10], many=True).data

        # Inspections query
        insp_qs = Inspection.objects.select_related("establishment").all()
        if q:
            insp_qs = insp_qs.filter(
                Q(code__icontains=q)
                | Q(section__icontains=q)  # FIXED: Removed parentheses
                | Q(establishment__name__icontains=q)
            )

        inspections = InspectionSerializer(insp_qs[:10], many=True).data

        # Generate search suggestions
        suggestions = self.generate_search_suggestions(q, establishments, users, inspections)

        return Response({
            "establishments": establishments,
            "users": users,
            "inspections": inspections,
            "suggestions": suggestions
        })

    def generate_search_suggestions(self, query, establishments, users, inspections):
        suggestions = []
        
        # Add establishment suggestions
        for est in establishments[:3]:
            suggestions.append({
                "type": "establishment",
                "name": est.get('name', ''),
                "description": f"Establishment in {est.get('city', '')}",
                "category": "Business",
                "icon": "🏢",
                "id": est.get('id')
            })
        
        # Add user suggestions
        for user in users[:3]:
            suggestions.append({
                "type": "user",
                "name": f"{user.get('first_name', '')} {user.get('last_name', '')}",
                "description": f"User - {user.get('userlevel', '')}",
                "category": "People",
                "icon": "👤",
                "id": user.get('id')
            })
        
        # Add inspection suggestions
        for insp in inspections[:3]:
            establishment_name = insp.get('establishment', {}).get('name', '') if isinstance(insp.get('establishment'), dict) else ''
            suggestions.append({
                "type": "inspection",
                "name": f"Inspection {insp.get('code', '')}",
                "description": f"Inspection for {establishment_name}",
                "category": "Inspections",
                "icon": "📋",
                "id": insp.get('id')
            })
        
        # Add generic suggestions based on search query
        if len(suggestions) < 5:
            generic_suggestions = [
                {"type": "suggestion", "name": f"Search '{query}' in establishments", "category": "Search", "icon": "🔍"},
                {"type": "suggestion", "name": f"Search '{query}' in users", "category": "Search", "icon": "🔍"},
                {"type": "suggestion", "name": f"Search '{query}' in inspections", "category": "Search", "icon": "🔍"},
            ]
            suggestions.extend(generic_suggestions[:5 - len(suggestions)])
        
        return suggestions[:8]  # Limit total suggestions


class SearchSuggestionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        q = request.query_params.get("q", "").strip()
        
        if not q or len(q) < 2:
            return Response({"suggestions": []})

        suggestions = []

        # Establishment suggestions
        establishment_suggestions = Establishment.objects.filter(
            Q(name__icontains=q) |
            Q(nature_of_business__icontains=q) |
            Q(city__icontains=q)
        )[:5]
        
        for est in establishment_suggestions:
            suggestions.append({
                "type": "establishment",
                "id": est.id,
                "name": est.name,
                "description": f"Establishment in {est.city}",
                "category": "Business",
                "icon": "🏢"
            })

        # User suggestions
        user_suggestions = User.objects.filter(
            Q(first_name__icontains=q) |
            Q(last_name__icontains=q) |
            Q(email__icontains=q)
        )[:5]
        
        for user in user_suggestions:
            suggestions.append({
                "type": "user",
                "id": user.id,
                "name": f"{user.first_name} {user.last_name}",
                "description": f"User - {user.userlevel}",
                "category": "People",
                "icon": "👤"
            })

        # Inspection suggestions - FIXED THE SYNTAX ERROR HERE
        inspection_suggestions = Inspection.objects.filter(
            Q(code__icontains=q) |
            Q(section__icontains=q)  # FIXED: Removed the incorrect parentheses
        ).select_related('establishment')[:5]
        
        for insp in inspection_suggestions:
            establishment_name = insp.establishment.name if insp.establishment else 'Unknown'
            suggestions.append({
                "type": "inspection",
                "id": insp.id,
                "name": f"Inspection {insp.code}",
                "description": f"Inspection for {establishment_name}",
                "category": "Inspections",
                "icon": "📋"
            })

        # Popular search terms
        popular_terms = ["restaurant", "hotel", "factory", "shop", "office", "mall", "school", "hospital"]
        matching_terms = [term for term in popular_terms if q.lower() in term.lower()]
        
        for term in matching_terms[:2]:
            suggestions.append({
                "type": "popular",
                "name": term,
                "description": "Popular search term",
                "category": "Popular",
                "icon": "🔥"
            })

        return Response({"suggestions": suggestions})


class SearchFilterOptionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Distinct municipalities (cities) from establishments
        cities = (
            Establishment.objects.order_by("city")
            .values_list("city", flat=True)
            .distinct()
        )
        # Sectors: use inspections sections and establishment nature_of_business samples
        sections = (
            Inspection.objects.order_by("section")
            .values_list("section", flat=True)
            .distinct()
        )
        nature_samples = (
            Establishment.objects.order_by("nature_of_business")
            .values_list("nature_of_business", flat=True)
            .distinct()
        )

        # Combine into a unique sorted list for UI convenience
        sector_options = sorted({s for s in sections if s} | {n for n in nature_samples if n})

        return Response({
            "municipalities": [c for c in cities if c],
            "sectors": sector_options,
            "risk_levels": [],
        })