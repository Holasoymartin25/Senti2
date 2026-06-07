@if ($paginator->hasPages())
<nav class="pagination-nav" role="navigation" aria-label="Pagination">
    <p class="pagination-summary">
        {{ __('admin.pagination_showing', [
            'from' => $paginator->firstItem(),
            'to' => $paginator->lastItem(),
            'total' => $paginator->total(),
        ]) }}
    </p>
    <div class="pagination-controls">
        @if ($paginator->onFirstPage())
            <span class="pagination-btn is-disabled" aria-disabled="true">{{ __('admin.pagination_previous') }}</span>
        @else
            <a href="{{ $paginator->previousPageUrl() }}" class="pagination-btn" rel="prev">{{ __('admin.pagination_previous') }}</a>
        @endif

        @foreach ($paginator->getUrlRange(
            max(1, $paginator->currentPage() - 2),
            min($paginator->lastPage(), $paginator->currentPage() + 2)
        ) as $page => $url)
            @if ($page == $paginator->currentPage())
                <span class="pagination-num is-active" aria-current="page">{{ $page }}</span>
            @else
                <a href="{{ $url }}" class="pagination-num">{{ $page }}</a>
            @endif
        @endforeach

        @if ($paginator->hasMorePages())
            <a href="{{ $paginator->nextPageUrl() }}" class="pagination-btn" rel="next">{{ __('admin.pagination_next') }}</a>
        @else
            <span class="pagination-btn is-disabled" aria-disabled="true">{{ __('admin.pagination_next') }}</span>
        @endif
    </div>
</nav>
@endif
