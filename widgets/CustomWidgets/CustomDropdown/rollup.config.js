export default args => {
    return args.configDefaultConfig.map(config => {
        return {
            ...config,
            external
        };
    });
};
const external = [/^mendix($|\/)/, /^react$/, /^react-dom($|\/)/, /^big.js$/];//, /^@seznam($|\/)/]

// original externals: [/^mendix($|\/)/, /^react($|\/)/, /^react-dom($|\/)/, /^big.js$/]
// we want react/jsx-runtime to be outside the bundle


