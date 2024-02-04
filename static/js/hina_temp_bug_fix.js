let hina_mode = 1; //1 = untestable version, 2 = testable version
if (hina_mode == 1){
    document.addEventListener('DOMContentLoaded', function() {
        const badgeBlocks = document.querySelectorAll('.select-left.badge-block');
        const seenBadges = new Map();

        badgeBlocks.forEach(block => {
            const badgeName = block.querySelector('.badge-name').textContent.trim().toLowerCase();
            if (seenBadges.has(badgeName)) {
                block.parentNode.removeChild(block);
            } else {
                seenBadges.set(badgeName, true);
            }
        });
    });
}
else if(hina_mode == 2) {
const badgeBlocks = document.querySelectorAll('.select-left.badge-block');
const seenBadges = new Map();
badgeBlocks.forEach(block => {
    const badgeName = block.querySelector('.badge-name').textContent.trim().toLowerCase();
    if (seenBadges.has(badgeName)) {
        block.parentNode.removeChild(block);
    } else {
        seenBadges.set(badgeName, true);
    }
});

}
