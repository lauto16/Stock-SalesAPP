from django.core.exceptions import ObjectDoesNotExist
from InventoryAPI.models import Provider
from rest_framework import serializers
from .models import ChangeLog


class ChangeLogSerializer(serializers.ModelSerializer):
    """
    Serializer for the ChangeLog model.

    Provides detailed information about a specific change entry, including
    the affected model, object data, field changes, and the user responsible
    for the modification.

    This serializer also resolves related model metadata (such as the model
    name and object details) and formats provider fields to return their
    display names instead of raw IDs.
    """

    model = serializers.SerializerMethodField()
    changed_by = serializers.StringRelatedField()
    object_id = serializers.CharField()
    object_data = serializers.SerializerMethodField()

    class Meta:
        model = ChangeLog
        fields = [
            "id",
            "model",
            "object_id",
            "object_data",
            "field_name",
            "old_value",
            "new_value",
            "changed_by",
            "changed_at",
        ]

    def get_model(self, obj):
        """
        Returns the name of the Django model associated with the change entry.

        Args:
            obj (ChangeLog): The ChangeLog instance.

        Returns:
            str: The model name.
        """
        return obj.content_type.model

    def get_object_data(self, obj):
        """
        Retrieves extra information about the modified object if available.

        Returns fields commonly used across models (e.g., code, name, provider).

        Args:
            obj (ChangeLog): The ChangeLog instance.

        Returns:
            dict | None: A dictionary with object metadata, or None if unavailable.
        """
        try:
            content = obj.content_object
        except (ObjectDoesNotExist, ValueError, TypeError):
            return None

        if not content:
            return None

        return {
            "code": getattr(content, "code", None),
            "name": getattr(content, "name", None),
            "provider_name": getattr(
                getattr(content, "provider", None),
                "name",
                None
            ),
        }

    def to_representation(self, instance):
        """
        Customizes the serialized result to replace provider IDs with readable names.

        If the changed field is `provider`, the serializer retrieves the provider
        objects and replaces ID values with their string representation.

        Args:
            instance (ChangeLog): The ChangeLog instance.

        Returns:
            dict: The serialized representation.
        """
        rep = super().to_representation(instance)

        if instance.field_name == "provider":
            old_provider = None
            new_provider = None

            try:
                if instance.old_value:
                    old_provider = Provider.objects.filter(id=instance.old_value).first()
            except (ValueError, TypeError):
                old_provider = None

            try:
                if instance.new_value:
                    new_provider = Provider.objects.filter(id=instance.new_value).first()
            except (ValueError, TypeError):
                new_provider = None

            rep["old_value"] = old_provider.name if old_provider else ""
            rep["new_value"] = new_provider.name if new_provider else ""

        return rep