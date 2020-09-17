Images automagically compressed by [Calibre](https://calibreapp.com)'s [image-actions](https://github.com/marketplace/actions/image-actions) ✨

Compression reduced images by <strong><%- overallPercentageSaved %>%</strong>, saving <strong><%- overallBytesSaved %></strong>.

| Filename | Before | After | Improvement |
| -------- | ------ | ----- | ----------- |
<% optimisedImages.forEach((image) => { -%>
| <code><%- image.name %></code> | <%- image.formattedBeforeStats %> | <%- image.formattedAfterStats %> | <%- image.formattedPercentChange %> |
<% }); %>

<% if(unoptimisedImages.length) { -%>
<%- unoptimisedImages.length %> <%- unoptimisedImages.length > 1 ? 'images' : 'image' %> did not require optimisation.
<% } %>