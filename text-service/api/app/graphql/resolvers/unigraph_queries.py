import strawberry
from sqlalchemy import select

from ...models.unigraph_model import Unigraph
from ..types.unigraph_type import UnigraphType


@strawberry.type
class UnigraphQuery:
    @strawberry.field()
    async def unigraph(
        self,
        info: strawberry.types.Info,
        id: strawberry.ID = strawberry.argument(description="Unigraph ID"),
    ) -> UnigraphType | None:
        db_factory = info.context["db_factory"]
        async with db_factory() as db:
            result = await db.execute(select(Unigraph).where(Unigraph.id == id))
            uni = result.scalar_one_or_none()
            if not uni:
                return None
            return UnigraphType(
                id=uni.id,
                key=uni.key,
                count=uni.count,
                accuracy=uni.accuracy,
            )
