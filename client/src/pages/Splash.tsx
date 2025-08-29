import React from "react";

export const Splash = (): JSX.Element => {
  return (
    <main className="relative w-[430px] h-[932px] bg-white">
      <header className="absolute w-[405px] h-12 top-0 left-3">
        <div className="h-12">
          <div className="relative w-[405px] h-12">
            <img
              className="absolute w-[29px] h-[22px] top-3.5 left-[361px]"
              alt="Status bar battery"
              src="/figmaAssets/status-bar---battery.png"
            />

            <div className="absolute w-11 h-[22px] top-3.5 left-[315px] bg-[url(/figmaAssets/status-bar---wi-fi.png)] bg-[100%_100%]">
              <img
                className="absolute w-[19px] h-[11px] top-[5px] left-0.5"
                alt="Status bar service"
                src="/figmaAssets/status-bar---service.png"
              />
            </div>

            <div className="absolute w-[51px] h-[22px] top-3.5 left-[30px] overflow-hidden">
              <div className="absolute w-[17px] h-[17px] top-0.5 left-[33px]" />

              <time className="absolute -top-px left-0.5 [font-family:'Poppins',Helvetica] font-normal text-black text-[16.2px] text-center tracking-[-0.26px] leading-[21.6px] whitespace-nowrap">
                9:41
              </time>
            </div>
          </div>
        </div>
      </header>

      <section className="flex flex-col items-center justify-center h-full">
        <img
          className="w-[229px] h-[132px]"
          alt="Lucent Ag Logo"
          src="/figmaAssets/image-20.png"
        />
      </section>
    </main>
  );
};
