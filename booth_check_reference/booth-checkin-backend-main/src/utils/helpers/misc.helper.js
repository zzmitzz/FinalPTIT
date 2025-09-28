export function getRandomElementByRate(array) {
    const totalRate = array.reduce((sum, element) => sum + element.rate || 0, 0)
    const randomNumber = Math.random() * totalRate
    let cumulativeRate = 0

    for (const [index, element] of array.entries()) {
        cumulativeRate += element.rate

        if (randomNumber <= cumulativeRate) {
            return [index, element]
        }
    }

    return [array.length - 1, array[array.length - 1]]
}
