// format
// name: the name of the judge, this is not used anywhere, and is only present to make this more readable
// msBorder: the milisecond border for the judge. This is the latest possible milisecond you can hit and get this judge.
// judgements are assumed to be symmetrical. If your game doesn't have symmetrical judges, your game is stupid, and does not need this function.
// value: how much this judge is worth. Don't worry about scaling this, This scales it for you.

// TODO: fill more defaults.
// use ktchi naming scheme.
const judgements = {
    iidx: [
        {name: "PGREAT", msBorder: 16.667, value: 2},
        {name: "GREAT", msBorder: 33.333, value: 1},
        {name: "GOOD", msBorder: 116.667, value: 0}
    ]
}

module.exports = {
    judgements
}