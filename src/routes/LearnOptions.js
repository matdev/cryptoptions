import React from 'react'

import './LearnOptions.css'

const LearnOptions = (props) => {

    return (
        <div>
            <div className='learn-options-content'>
                <h1> A brief intro about options</h1>
                <h2> What are options ? </h2>

                <p>
                    In finance, options are financial derivatives that give the holder (buyer) the right, but not the
                    obligation, to buy or sell an underlying asset at a predetermined price within a specified period of
                    time. The underlying asset can be a stock, bond, commodity, currency, or other financial instrument
                    such as a cryptocurrency.
                </p>
                <p>
                    Options provide investors with flexibility and the opportunity to profit from price movements in the
                    underlying asset without actually owning it.
                    They are traded on exchanges and come in two primary forms: Call and Put options
                </p>

                <h2> What is a Call option ?
                </h2>
                <p>
                    A call option gives the buyer the right to buy the underlying asset at the predetermined price
                    (strike price) before or on the expiration date. Call options are typically used when the buyer
                    expects the price of the underlying asset to rise. By owning a call option, the buyer can
                    potentially benefit from purchasing the asset at a lower strike price and selling it at a higher
                    market price.

                </p>
                <h2> What is a Put option ?
                </h2>
                <p>
                    A put option grants the buyer the right to sell the underlying asset at the strike price before or
                    on the expiration date. Put options are often used when the buyer believes the price of the
                    underlying asset will decline. By owning a put option, the buyer can potentially profit from selling
                    the asset at a higher strike price and buying it back at a lower market price.
                </p>

                <h2> What are the factors influencing the price of an option ?
                </h2>
                <p>
                    The option's premium is the price paid by the buyer to acquire the option. It represents the cost of
                    holding the option. It is influenced by factors such as the underlying asset's price and volatility,
                    time to expiration of the option, interest-free rate, and market conditions.
                </p>
            </div>
        </div>
    )
}

export default LearnOptions;
